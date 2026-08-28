import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight, Flame, Leaf, MapPin, MessageCircle, Minus, Moon, Phone, Plus, ShoppingBag, Sprout, Star, Sun, Trash2, UtensilsCrossed, Wheat, X, Apple, Chrome,
} from "lucide-react";
import { cn, money } from "../lib/utils";
import { LINKS, RESTAURANT } from "../lib/seed";
import { useCartCount, useCartTotal, useStore } from "../lib/store";
import { Badge, Button, Drawer, Field, Input, Modal, Segmented } from "./ui";

/* ---------------- Brand mark (custom SVG) ---------------- */

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" className="ember-gradient" />
      <path
        d="M20 8c.6 3.8-4.8 6.2-4.8 11.2 0 2.6 1.5 4.4 3.2 5.2-.5-3.4 2.4-4.6 2.2-7.6 2.9 1.6 5.6 4.5 5.6 8.4 0 1.5-.4 2.9-1.1 4 2.7-1.2 5.9-4 5.9-8.6C31 14 22.7 12.5 20 8Z"
        fill="#fff"
        opacity="0.95"
      />
      <path d="M13 30.5h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/* ---------------- Scroll reveal ---------------- */

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.6, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({ kicker, title, right }: { kicker: string; title: string; right?: ReactNode }) {
  const words = title.split(" ");
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-ember-600 dark:text-ember-400 mb-2.5">{kicker}</p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.08] font-bold text-ink dark:text-stone-50">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
              <motion.span
                className="inline-block"
                initial={{ y: "112%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: i * 0.055, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {w}
                {i < words.length - 1 ? "\u00A0" : ""}
              </motion.span>
            </span>
          ))}
        </h2>
      </div>
      {right}
    </div>
  );
}

/* ---------------- Scramble-decode text ---------------- */

export function Scramble({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const chars = "◆·—#%&abcdefghikmnoprstw";
    const totalFrames = 30;
    let frame = 0;
    let raf = 0;
    const timeout = setTimeout(() => {
      const step = () => {
        frame += 1;
        const reveal = Math.floor((frame / totalFrames) * text.length);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          if (i < reveal || text[i] === " ") s += text[i];
          else s += chars[Math.floor(Math.random() * chars.length)];
        }
        setOut(s);
        if (frame < totalFrames) raf = requestAnimationFrame(step);
        else setOut(text);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      setOut(text);
    };
  }, [text, delay]);
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}

/* ---------------- Dietary tag chips ---------------- */

const TAG_META = {
  V: { icon: Leaf, label: "Vegetarian", cls: "bg-green-100 text-green-700 dark:bg-green-950/70 dark:text-green-300" },
  VG: { icon: Sprout, label: "Vegan", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300" },
  GF: { icon: Wheat, label: "Gluten-free", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300" },
  SPICY: { icon: Flame, label: "Spicy", cls: "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300" },
} as const;

export function TagChip({ tag, short }: { tag: keyof typeof TAG_META; short?: boolean }) {
  const M = TAG_META[tag];
  const I = M.icon;
  return (
    <span title={M.label} aria-label={M.label} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", M.cls)}>
      <I size={11} />
      {!short && M.label}
    </span>
  );
}

/* ---------------- Live order ticker ---------------- */

export function OrderTicker() {
  const all = useStore((s) => s.orders);
  const orders = all.slice(0, 8); // derive outside the selector — keep the snapshot stable
  const items = orders.map((o) => `${o.code} · ${o.channel === "pickup" ? "Pickup" : "Delivery"} · ${money(o.total)}`);
  const strip = [...items, ...items];
  return (
    <div className="relative overflow-hidden bg-ink text-paper/90 dark:bg-stone-900 border-b border-white/10">
      <div className="flex items-center gap-3 max-w-7xl mx-auto px-4 h-9">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ember-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-ember-pulse" /> Live
        </span>
        <div className="relative flex-1 overflow-hidden" aria-hidden>
          <div className="flex whitespace-nowrap animate-marquee gap-10 text-[12px] font-mono">
            {strip.map((t, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-ember-500">◆</span> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Navbar (customer) ---------------- */

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartCount();
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const user = useStore((s) => s.user);
  const openAuth = useStore((s) => s.openAuth);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const accepting = useStore((s) => s.accepting);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Live Menu" },
    { to: "/reserve", label: "Book a Table" },
    { to: "/track", label: "Track Order" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-paper/85 dark:bg-stone-950/85 backdrop-blur-md shadow-sm border-b border-stone-200/70 dark:border-stone-800" : "bg-transparent",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4" aria-label="Main">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandMark className="w-10 h-10 transition-transform duration-300 group-hover:rotate-6" />
          <span className="leading-none min-w-0">
            <span className="block font-display font-bold text-[16.5px] sm:text-[19px] text-ink dark:text-stone-50 truncate">{RESTAURANT.name}</span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">Indonesian · Kigali</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "px-3.5 py-2 rounded-lg text-[13.5px] font-semibold transition-colors",
                location.pathname === l.to
                  ? "text-ember-600 dark:text-ember-400 bg-ember-500/10"
                  : "text-stone-600 dark:text-stone-300 hover:text-ink dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/70",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!accepting && (
            <Badge tone="red" className="hidden sm:inline-flex">Kitchen offline</Badge>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-10 h-10 grid place-items-center rounded-lg text-stone-500 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
            className="relative w-10 h-10 grid place-items-center rounded-lg text-stone-600 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full ember-gradient text-white text-[10px] font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          {user ? (
            <Link
              to={user.role === "ADMIN" ? "/dashboard" : "/track"}
              className="hidden sm:flex items-center gap-2 h-10 pl-2.5 pr-4 rounded-full border border-stone-300 dark:border-stone-700 text-[13px] font-semibold hover:border-ember-500 transition-colors"
            >
              <span className="w-6 h-6 rounded-full ember-gradient text-white grid place-items-center text-[11px] font-bold">{user.name[0]}</span>
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Button size="sm" variant="outline" className="hidden sm:inline-flex h-10" onClick={() => openAuth("signin")}>
              Sign in
            </Button>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden w-10 h-10 grid place-items-center rounded-lg text-stone-600 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800"
          >
            {menuOpen ? <X size={20} /> : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h14M3 14h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-paper/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="px-3 py-2.5 rounded-lg text-[15px] font-semibold hover:bg-stone-200/50 dark:hover:bg-stone-800">
                  {l.label}
                </Link>
              ))}
              <button onClick={() => { openAuth("signin"); setMenuOpen(false); }} className="px-3 py-2.5 rounded-lg text-[15px] font-semibold text-ember-600 text-left">
                Sign in / Partner with us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------- Footer ---------------- */

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-stone-300 dark:bg-stone-900 grain relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr] relative">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark className="w-10 h-10" />
            <span className="font-display text-xl font-bold text-white">{RESTAURANT.fullName}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
            {RESTAURANT.tagline}. Order direct from our kitchen — every franc goes to the food, the staff and the fire.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm">
            <Star size={15} className="text-ember-400 fill-ember-400" />
            <span className="font-semibold text-white">{RESTAURANT.rating}</span>
            <span className="text-stone-500">· {RESTAURANT.reviews} Google reviews</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">Order</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/menu" className="hover:text-ember-300 transition-colors">Live menu</Link></li>
            <li><Link to="/checkout" className="hover:text-ember-300 transition-colors">Checkout</Link></li>
            <li><Link to="/track" className="hover:text-ember-300 transition-colors">Track my order</Link></li>
            <li><Link to="/reserve" className="hover:text-ember-300 transition-colors">Book a table</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">Visit us</p>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2.5"><UtensilsCrossed size={15} className="mt-0.5 text-ember-500 shrink-0" />{RESTAURANT.address}</li>
            <li className="flex gap-2.5"><Flame size={15} className="mt-0.5 text-ember-500 shrink-0" />{RESTAURANT.hours}</li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">Talk to us</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href={`tel:${LINKS.phone}`} className="flex gap-2.5 hover:text-ember-300 transition-colors">
                <Phone size={15} className="mt-0.5 text-ember-500 shrink-0" />{RESTAURANT.phone}
              </a>
            </li>
            <li>
              <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" className="flex gap-2.5 hover:text-emerald-300 transition-colors">
                <MessageCircle size={15} className="mt-0.5 text-ember-500 shrink-0" />WhatsApp
              </a>
            </li>
            <li>
              <a href={LINKS.maps} target="_blank" rel="noreferrer" className="flex gap-2.5 hover:text-ember-300 transition-colors">
                <MapPin size={15} className="mt-0.5 text-ember-500 shrink-0" />Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-[12px] text-stone-500">
          <span>© {new Date().getFullYear()} {RESTAURANT.fullName} · Kigali, Rwanda</span>
          <span>Site & ordering powered by <span className="text-stone-300 font-semibold">EatLocal OS</span> — 0% commission, the restaurant keeps it all</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Cart drawer ---------------- */

export function CartDrawer() {
  const navigate = useNavigate();
  const open = useStore((s) => s.cartOpen);
  const setOpen = useStore((s) => s.setCartOpen);
  const cart = useStore((s) => s.cart);
  const changeQty = useStore((s) => s.changeQty);
  const removeLine = useStore((s) => s.removeLine);
  const accepting = useStore((s) => s.accepting);
  const total = useCartTotal();

  return (
    <Drawer open={open} onClose={() => setOpen(false)} label="Your order">
      <div className="flex items-center justify-between px-5 h-16 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <h2 className="font-display text-xl font-bold">Your order</h2>
        <button onClick={() => setOpen(false)} aria-label="Close cart" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto slim-scroll px-5 py-4">
        {cart.length === 0 ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="mx-auto w-14 h-14 rounded-full bg-ember-500/10 grid place-items-center text-ember-500 mb-4"><ShoppingBag size={22} /></div>
              <p className="font-display text-lg font-bold">Nothing here yet</p>
              <p className="text-sm text-stone-500 mt-1.5 mb-5">The wok is hot. Go pick something.</p>
              <Button onClick={() => { setOpen(false); navigate("/menu"); }}>Browse the live menu</Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {cart.map((l) => (
                <motion.li
                  key={l.key}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                  className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[14.5px] leading-tight">{l.name}</p>
                      {l.modifiers.length > 0 && (
                        <p className="text-[12px] text-stone-500 mt-1">{l.modifiers.map((m) => m.name).join(" · ")}</p>
                      )}
                      {l.notes && <p className="text-[12px] italic text-stone-400 mt-1">“{l.notes}”</p>}
                    </div>
                    <button onClick={() => removeLine(l.key)} aria-label={`Remove ${l.name}`} className="text-stone-400 hover:text-red-500 transition-colors shrink-0 mt-0.5">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-700 p-0.5">
                      <button onClick={() => changeQty(l.key, -1)} aria-label="Decrease quantity" className="w-7 h-7 grid place-items-center rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-700"><Minus size={13} /></button>
                      <span className="w-7 text-center text-sm font-bold font-mono">{l.qty}</span>
                      <button onClick={() => changeQty(l.key, 1)} aria-label="Increase quantity" className="w-7 h-7 grid place-items-center rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-700"><Plus size={13} /></button>
                    </div>
                    <span className="font-bold text-[15px]">{money(l.unitPrice * l.qty)}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-stone-200 dark:border-stone-800 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0 space-y-3">
          <div className="flex justify-between text-sm text-stone-500">
            <span>Subtotal</span><span className="font-semibold text-ink dark:text-stone-100">{money(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">EatLocal platform fee</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">FRw 0 — always</span>
          </div>
          {!accepting && <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">The kitchen is offline right now — you can browse, but checkout opens when we're back.</p>}
          <Button size="lg" className="w-full" disabled={!accepting} onClick={() => { setOpen(false); navigate("/checkout"); }}>
            Go to checkout <ArrowRight size={17} />
          </Button>
        </div>
      )}
    </Drawer>
  );
}

/* ---------------- Auth modal (NextAuth stand-in) ---------------- */

export function AuthModal() {
  const open = useStore((s) => s.authOpen);
  const tab = useStore((s) => s.authTab);
  const close = useStore((s) => s.closeAuth);
  const openAuth = useStore((s) => s.openAuth);
  const login = useStore((s) => s.login);
  const loginAdmin = useStore((s) => s.loginAdmin);
  const toast = useStore((s) => s.toast);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [step, setStep] = useState(0);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => { if (!open) { setStep(0); setConnecting(false); } }, [open]);

  const submitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return toast("Please fill in email and password.", "error");
    login(tab === "signup" ? name || "Food Lover" : email.split("@")[0], email);
    close();
    toast(`Selamat datang, ${tab === "signup" ? name || "friend" : email.split("@")[0]}!`);
  };

  const googleLogin = () => {
    login("Google Guest", "guest@gmail.com");
    close();
    toast("Signed in with Google");
  };

  const runConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setStep(2);
    }, 2200);
  };

  return (
    <Modal open={open} onClose={close} label="Sign in" wide={tab === "partner"}>
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ember-600 dark:text-ember-400 mb-1.5">
              {tab === "partner" ? "EatLocal OS for restaurants" : "EatLocal OS"}
            </p>
            <h2 className="font-display text-2xl sm:text-[28px] font-bold leading-tight">
              {tab === "signin" ? "Welcome back" : tab === "signup" ? "Create your account" : "Keep 100% of every order"}
            </h2>
          </div>
          <button onClick={close} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800"><X size={18} /></button>
        </div>

        {tab !== "partner" && (
          <>
            <div className="flex gap-2 mt-6">
              {(["signin", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => openAuth(t)}
                  className={cn("flex-1 h-10 rounded-lg text-sm font-semibold transition-colors", tab === t ? "bg-ink text-paper dark:bg-stone-100 dark:text-ink" : "text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800")}
                >
                  {t === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={submitCustomer} className="mt-6 space-y-4">
              {tab === "signup" && (
                <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aline Uwase" autoComplete="name" /></Field>
              )}
              <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></Field>
              <Field label="Password"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></Field>
              <Button type="submit" size="lg" className="w-full">
                {tab === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">or</span>
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
            </div>
            <Button variant="outline" size="lg" className="w-full" onClick={googleLogin}>
              <Chrome size={17} className="text-ember-600" /> Continue with Google
            </Button>
          </>
        )}

        {tab === "partner" && (
          <div className="mt-6">
            {/* progress */}
            <div className="flex items-center gap-2 mb-7">
              {["Business details", "Stripe Connect payout", "Live"].map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <span className={cn("w-7 h-7 rounded-full grid place-items-center text-[12px] font-bold shrink-0", step >= i ? "ember-gradient text-white" : "bg-stone-200 dark:bg-stone-800 text-stone-400")}>
                    {step > i ? "✓" : i + 1}
                  </span>
                  <span className={cn("text-[12px] font-semibold hidden sm:block", step >= i ? "text-ink dark:text-stone-100" : "text-stone-400")}>{label}</span>
                  {i < 2 && <span className={cn("h-px flex-1", step > i ? "bg-ember-500" : "bg-stone-200 dark:bg-stone-800")} />}
                </div>
              ))}
            </div>

            {step === 0 && (
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); if (!name || !email) return toast("Restaurant name and email are required.", "error"); setStep(1); }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Restaurant name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Borneo Indonesian Restaurant" /></Field>
                  <Field label="Owner name"><Input placeholder="Full legal name" /></Field>
                  <Field label="Work email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@restaurant.com" /></Field>
                  <Field label="Phone"><Input placeholder="+250 7XX XXX XXX" /></Field>
                </div>
                <Field label="EIN / Tax ID" hint="Used for payouts — encrypted, never shown on your storefront."><Input placeholder="XX-XXXXXXX" /></Field>
                <Button size="lg" className="w-full" type="submit">Continue to payout setup <ArrowRight size={16} /></Button>
              </form>
            )}

            {step === 1 && (
              <div>
                <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-900/70 p-5">
                  <p className="font-bold text-[15px] flex items-center gap-2">Stripe Connect onboarding</p>
                  <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
                    Funds from every order go <span className="font-semibold text-ink dark:text-stone-100">directly to your bank account</span>. EatLocal only processes the transaction — we never touch a commission.
                  </p>
                  {!connecting ? (
                    <Button size="lg" className="w-full mt-4" onClick={runConnect}>Connect bank account with Stripe</Button>
                  ) : (
                    <div className="mt-4">
                      <div className="h-2.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                        <motion.div className="h-full ember-gradient rounded-full" initial={{ width: "4%" }} animate={{ width: "96%" }} transition={{ duration: 2, ease: "easeInOut" }} />
                      </div>
                      <p className="text-[12px] font-mono text-stone-500 mt-2.5 animate-pulse">Verifying business · creating connected account · linking payout method…</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-center py-6">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="mx-auto w-16 h-16 rounded-full bg-emerald-500 text-white grid place-items-center mb-4">
                  <Flame size={28} />
                </motion.div>
                <p className="font-display text-2xl font-bold">You're live 🎉</p>
                <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">Flat $99/mo. Zero commission. Your dashboard is ready with today's demo data.</p>
                <Button
                  size="lg"
                  className="mt-6"
                  onClick={() => { loginAdmin(name || "Restaurant Owner", email || "owner@restaurant.com"); close(); navigate("/dashboard"); toast("Signed in as restaurant owner"); }}
                >
                  Open your dashboard <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---------------- Checkout stepper ---------------- */

export function QtyStepper({ qty, onChange, small }: { qty: number; onChange: (d: number) => void; small?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900", small ? "p-0.5" : "p-1")}>
      <button onClick={() => onChange(-1)} aria-label="Decrease" className={cn("grid place-items-center rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-700", small ? "w-7 h-7" : "w-9 h-9")}><Minus size={small ? 13 : 15} /></button>
      <span className={cn("text-center font-bold font-mono", small ? "w-6 text-sm" : "w-8")}>{qty}</span>
      <button onClick={() => onChange(1)} aria-label="Increase" className={cn("grid place-items-center rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-700", small ? "w-7 h-7" : "w-9 h-9")}><Plus size={small ? 13 : 15} /></button>
    </div>
  );
}

export { Apple };
