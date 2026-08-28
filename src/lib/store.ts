import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useMemo } from "react";
import type {
  CartLine, Category, Order, OrderStatus, Promotion, Reservation, Toast, User,
} from "./types";
import { SEED_CATEGORIES, SEED_ORDERS, SEED_PROMOS, SEED_RESERVATIONS, makeRandomOrder } from "./seed";
import { clamp, isPromoLive, orderCode, uid } from "./utils";

/**
 * Client-side data layer for the EatLocal OS demo.
 * Every slice below maps to a Prisma model — in production these actions
 * become API calls to /app/api route handlers backed by PostgreSQL.
 */

interface Store {
  /* prefs */
  theme: "light" | "dark";
  toggleTheme: () => void;

  /* auth (NextAuth in production) */
  user: User | null;
  login: (name: string, email: string) => void;
  loginAdmin: (name: string, email: string) => void;
  logout: () => void;

  /* restaurant runtime */
  accepting: boolean;
  toggleAccepting: () => void;

  /* menu / inventory */
  categories: Category[];
  updateItem: (catId: string, itemId: string, patch: Partial<Category["items"][number]>) => void;
  reorderItems: (catId: string, from: number, to: number) => void;

  /* cart & checkout */
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  changeQty: (key: string, delta: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (b: boolean) => void;

  /* auth modal */
  authOpen: boolean;
  authTab: "signin" | "signup" | "partner";
  openAuth: (tab?: Store["authTab"]) => void;
  closeAuth: () => void;

  /* orders */
  orders: Order[];
  placeOrder: (payload: {
    customer: { name: string; phone: string; email?: string };
    channel: "pickup" | "delivery";
    address?: string;
    notes?: string;
    tip: number;
    payment: Order["payment"];
  }) => Order;
  setOrderStatus: (id: string, status: OrderStatus) => void;

  /* reservations */
  reservations: Reservation[];
  addReservation: (r: Omit<Reservation, "id" | "createdAt" | "status">) => Reservation;
  setReservationStatus: (id: string, status: Reservation["status"]) => void;

  /* promotions */
  promos: Promotion[];
  addPromo: (p: Omit<Promotion, "id">) => void;
  togglePromo: (id: string) => void;
  removePromo: (id: string) => void;

  /* toasts */
  toasts: Toast[];
  toast: (msg: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      theme: (document.documentElement.classList.contains("dark") ? "dark" : "light") as "light" | "dark",
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle("dark", next === "dark");
          try { localStorage.setItem("borneo-theme", next); } catch { /* noop */ }
          return { theme: next };
        }),

      user: null,
      login: (name, email) => set({ user: { name, email, role: "CUSTOMER" } }),
      loginAdmin: (name, email) => set({ user: { name, email, role: "ADMIN" } }),
      logout: () => set({ user: null }),

      accepting: true,
      toggleAccepting: () => set((s) => ({ accepting: !s.accepting })),

      categories: SEED_CATEGORIES,
      updateItem: (catId, itemId, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id !== catId ? c : { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) },
          ),
        })),
      reorderItems: (catId, from, to) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== catId) return c;
            const items = [...c.items];
            const [moved] = items.splice(from, 1);
            items.splice(to, 0, moved);
            return { ...c, items };
          }),
        })),

      cart: [],
      addToCart: (line) =>
        set((s) => {
          const existing = s.cart.find((l) => l.key === line.key);
          if (existing) {
            return { cart: s.cart.map((l) => (l.key === line.key ? { ...l, qty: l.qty + line.qty } : l)), cartOpen: true };
          }
          return { cart: [...s.cart, line], cartOpen: true };
        }),
      changeQty: (key, delta) =>
        set((s) => ({
          cart: s.cart
            .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
            .filter((l) => l.qty > 0),
        })),
      removeLine: (key) => set((s) => ({ cart: s.cart.filter((l) => l.key !== key) })),
      clearCart: () => set({ cart: [] }),
      cartOpen: false,
      setCartOpen: (b) => set({ cartOpen: b }),

      authOpen: false,
      authTab: "signin",
      openAuth: (tab = "signin") => set({ authOpen: true, authTab: tab }),
      closeAuth: () => set({ authOpen: false }),

      orders: SEED_ORDERS,
      placeOrder: ({ customer, channel, address, notes, tip, payment }) => {
        const { cart, promos } = get();
        const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.qty, 0);
        const livePromo = promos.find((p) => isPromoLive(p));
        const discount = livePromo ? Math.round((subtotal * livePromo.percent) / 100) : 0;
        const deliveryFee = channel === "delivery" ? 2000 : 0;
        const order: Order = {
          id: uid("ord"),
          code: orderCode(),
          customer,
          channel,
          address,
          notes,
          items: cart.map((l) => ({ name: l.name, qty: l.qty, price: l.unitPrice, modifiers: l.modifiers })),
          subtotal,
          discount,
          platformFee: 0, // zero commission. always.
          deliveryFee,
          tip,
          total: subtotal - discount + deliveryFee + tip,
          status: "new",
          placedAt: Date.now(),
          eta: Date.now() + (channel === "delivery" ? 40 : 22) * 60_000,
          promoName: livePromo?.name,
          payment,
        };
        const stockBefore = get().categories.flatMap((c) => c.items);
        set((s) => ({
          orders: [order, ...s.orders].slice(0, 60),
          cart: [],
          cartOpen: false,
          // real inventory: every order drains stock; 0 units → auto-86'd off the menu
          categories: s.categories.map((c) => ({
            ...c,
            items: c.items.map((i) => {
              const bought = cart.filter((l) => l.itemId === i.id).reduce((n, l) => n + l.qty, 0);
              if (!bought) return i;
              const stock = Math.max(0, i.stock - bought);
              return { ...i, stock, available: stock > 0 ? i.available : false };
            }),
          })),
        }));
        cart.forEach((l) => {
          const it = stockBefore.find((i) => i.id === l.itemId);
          if (it && it.stock - l.qty <= 0) get().toast(`${l.name} just sold out — 86'd from the live menu`, "info");
        });
        return order;
      },
      setOrderStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),

      reservations: SEED_RESERVATIONS,
      addReservation: (r) => {
        const res: Reservation = { ...r, id: uid("res"), status: "upcoming", createdAt: Date.now() };
        set((s) => ({ reservations: [...s.reservations, res] }));
        return res;
      },
      setReservationStatus: (id, status) =>
        set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, status } : r)) })),

      promos: SEED_PROMOS,
      addPromo: (p) => set((s) => ({ promos: [{ ...p, id: uid("pr") }, ...s.promos] })),
      togglePromo: (id) => set((s) => ({ promos: s.promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })),
      removePromo: (id) => set((s) => ({ promos: s.promos.filter((p) => p.id !== id) })),

      toasts: [],
      toast: (msg, tone = "success") => {
        const id = ++toastId;
        set((s) => ({ toasts: [...s.toasts, { id, msg, tone }] }));
        setTimeout(() => get().dismissToast(id), 4200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "eatlocal-os-v2",
      version: 2,
      partialize: (s) => ({
        theme: s.theme,
        user: s.user,
        accepting: s.accepting,
        categories: s.categories,
        cart: s.cart,
        orders: s.orders,
        reservations: s.reservations,
        promos: s.promos,
      }),
      /**
       * Defensive rehydration: if persisted data from an older session doesn't
       * match the current schema, fall back to fresh seed data for that slice
       * instead of letting a malformed object crash the render tree.
       */
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        const cats = p.categories as Category[] | undefined;
        const validCats =
          Array.isArray(cats) &&
          cats.length > 0 &&
          cats.every(
            (c) =>
              c && typeof c.id === "string" && typeof c.name === "string" &&
              Array.isArray(c.items) &&
              c.items.every(
                (i) => i && typeof i.price === "number" && Array.isArray(i.tags) && Array.isArray(i.modifiers),
              ),
          );
        const orders = p.orders as Order[] | undefined;
        const validOrders =
          !Array.isArray(orders) ||
          orders.every((o) => o && typeof o.total === "number" && typeof o.status === "string" && Array.isArray(o.items) && !!o.customer);
        const reservations = p.reservations as Reservation[] | undefined;
        const validRes =
          !Array.isArray(reservations) ||
          reservations.every((r) => r && typeof r.date === "string" && typeof r.time === "string" && typeof r.party === "number");
        const promos = p.promos as Promotion[] | undefined;
        const validPromos =
          !Array.isArray(promos) ||
          promos.every((pr) => pr && typeof pr.start === "number" && typeof pr.end === "number" && typeof pr.percent === "number");
        const cart = p.cart as CartLine[] | undefined;
        return {
          ...current,
          theme: p.theme === "dark" || p.theme === "light" ? p.theme : current.theme,
          user: (p.user as User | null | undefined) ?? current.user,
          accepting: typeof p.accepting === "boolean" ? p.accepting : current.accepting,
          categories: validCats ? (cats as Category[]) : current.categories,
          cart: Array.isArray(cart) ? cart.filter((l) => l && typeof l.unitPrice === "number") : current.cart,
          orders: validOrders ? (orders as Order[]) : current.orders,
          reservations: validRes ? (reservations as Reservation[]) : current.reservations,
          promos: validPromos ? (promos as Promotion[]) : current.promos,
        };
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/*  Live feed — stands in for the SSE/WebSocket connection.            */
/*  Kitchen orders auto-advance; new online orders stream in while     */
/*  the restaurant is accepting orders.                                */
/* ------------------------------------------------------------------ */

export function useLiveFeed() {
  useEffect(() => {
    const tick = setInterval(() => {
      try {
      const s = useStore.getState();
      const now = Date.now();

      // auto-advance kitchen tickets so tracking feels alive
      s.orders.forEach((o) => {
        const age = now - o.placedAt;
        if (o.status === "new" && age > 45_000) s.setOrderStatus(o.id, "preparing");
        else if (o.status === "preparing" && age > 4 * 60_000) s.setOrderStatus(o.id, "ready");
        else if (o.status === "ready" && age > 9 * 60_000) s.setOrderStatus(o.id, "completed");
      });

      // ~12% chance per tick (≈ every 40s) a new online order arrives
      if (s.accepting && Math.random() < 0.12) {
        const incoming = makeRandomOrder();
        useStore.setState((st) => ({ orders: [{ ...incoming, id: uid("ord") }, ...st.orders].slice(0, 60) }));
        s.toast(`New online order ${incoming.code} · ${incoming.channel}`, "info");
      }
      } catch {
        /* a hiccup in the simulated feed must never take the kitchen down */
      }
    }, 5000);
    return () => clearInterval(tick);
  }, []);
}

/* convenience selectors — NB: selectors must return stable references
   (store slices/primitives). Deriving new arrays inside the selector
   would make React's useSyncExternalStore loop. */
export const useLowStock = () => {
  const categories = useStore((s) => s.categories);
  return useMemo(
    () => categories.flatMap((c) => c.items.filter((i) => i.stock < 10).map((i) => ({ item: i, category: c.name }))),
    [categories],
  );
};

export const useCartCount = () => useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
export const useCartTotal = () => useStore((s) => s.cart.reduce((n, l) => n + l.unitPrice * l.qty, 0));
export const useLivePromo = () => useStore((s) => s.promos.find((p) => isPromoLive(p)) ?? null);
export const useNewOrderCount = () => useStore((s) => s.orders.filter((o) => o.status === "new").length);

export { clamp };
