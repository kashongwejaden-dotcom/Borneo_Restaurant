import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";
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
        set((s) => ({ orders: [order, ...s.orders].slice(0, 60), cart: [], cartOpen: false }));
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
      name: "eatlocal-os-v1",
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
    }, 5000);
    return () => clearInterval(tick);
  }, []);
}

/* convenience selectors */
export const useLowStock = () =>
  useStore((s) =>
    s.categories.flatMap((c) => c.items.filter((i) => i.stock < 10).map((i) => ({ item: i, category: c.name }))),
  );

export const useCartCount = () => useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
export const useCartTotal = () => useStore((s) => s.cart.reduce((n, l) => n + l.unitPrice * l.qty, 0));
export const useLivePromo = () => useStore((s) => s.promos.find((p) => isPromoLive(p)) ?? null);
export const useNewOrderCount = () => useStore((s) => s.orders.filter((o) => o.status === "new").length);

export { clamp };
