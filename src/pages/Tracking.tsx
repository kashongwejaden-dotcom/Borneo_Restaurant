import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bike, Check, ChefHat, Clock, Flame, Inbox, Phone } from "lucide-react";
import { cn, fmtTime, money, timeAgo } from "../lib/utils";
import { useStore } from "../lib/store";
import { Button, Input } from "../components/ui";
import { Footer } from "../components/shared";
import { RESTAURANT } from "../lib/seed";
import type { Order } from "../lib/types";

const STEPS_PICKUP = [
  { key: "received", label: "Received", icon: Inbox, desc: "Ticket hit the kitchen pass" },
  { key: "preparing", label: "Preparing", icon: ChefHat, desc: "On the fire right now" },
  { key: "ready", label: "Ready for pickup", icon: Flame, desc: "Packed and waiting for you" },
  { key: "completed", label: "Picked up", icon: Check, desc: "Selamat makan!" },
];
const STEPS_DELIVERY = [
  { key: "received", label: "Received", icon: Inbox, desc: "Ticket hit the kitchen pass" },
  { key: "preparing", label: "Preparing", icon: ChefHat, desc: "On the fire right now" },
  { key: "ready", label: "Out for delivery", icon: Bike, desc: "Rider is on the way" },
  { key: "completed", label: "Delivered", icon: Check, desc: "Selamat makan!" },
];

const STATUS_INDEX: Record<Order["status"], number> = { new: 0, preparing: 1, ready: 2, completed: 3 };

export default function Tracking() {
  const { code } = useParams();
  const navigate = useNavigate();
  const orders = useStore((s) => s.orders);
  const [query, setQuery] = useState("");
  const [, forceTick] = useState(0);

  // re-render every 5s so the "time ago" / eta stay fresh alongside the live feed
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const order =
    orders.find((o) => o.code.toLowerCase() === (code ?? "").toLowerCase()) ??
    (code ? undefined : orders[0]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 min-h-[70vh]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-ember-600 dark:text-ember-400 mb-2">Real-time tracking</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Where's my order?</h1>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); if (query.trim()) navigate(`/track/${query.trim().toUpperCase()}`); }}
        >
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="BR-1047" className="w-36 sm:w-44 font-mono" aria-label="Ticket code" />
          <Button type="submit" variant="dark">Find</Button>
        </form>
      </div>

      {!order ? (
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 p-10 text-center">
          <p className="font-display text-2xl font-bold">No ticket found for “{code}”</p>
          <p className="mt-2 text-sm text-stone-500">Double-check the code on your receipt — or call us and we'll sort it.</p>
          <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 mt-5 font-bold text-ember-600 dark:text-ember-400">
            <Phone size={16} /> {RESTAURANT.phone}
          </a>
        </div>
      ) : (
        <OrderTicket order={order} />
      )}

      {orders.length > 1 && (
        <div className="mt-12">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-stone-400 mb-3.5">Recent tickets</p>
          <div className="flex gap-2.5 flex-wrap">
            {orders.slice(0, 6).map((o) => (
              <button
                key={o.id}
                onClick={() => navigate(`/track/${o.code}`)}
                className={cn(
                  "px-4 py-2.5 rounded-xl border text-[13px] font-bold font-mono transition-all",
                  o.id === order?.id ? "border-ember-500 bg-ember-500/10 text-ember-600 dark:text-ember-400" : "border-stone-200 dark:border-stone-800 text-stone-500 hover:border-ember-400",
                )}
              >
                {o.code} <span className={cn("ml-1.5 uppercase text-[10px] tracking-wider", o.status === "completed" ? "text-stone-400" : "text-emerald-500")}>{o.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function OrderTicket({ order }: { order: Order }) {
  const steps = order.channel === "delivery" ? STEPS_DELIVERY : STEPS_PICKUP;
  const idx = STATUS_INDEX[order.status];
  const minsLeft = Math.max(0, Math.round((order.eta - Date.now()) / 60000));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        {/* timeline card */}
        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[13px] font-bold text-ember-600 dark:text-ember-400">{order.code}</p>
              <p className="text-[12px] text-stone-400 mt-1">Placed {timeAgo(order.placedAt)} · {order.channel === "pickup" ? "Pickup" : "Delivery"}</p>
            </div>
            {order.status !== "completed" ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 text-[13px] font-bold">
                <Clock size={14} /> ~{minsLeft} min left
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-stone-200/70 dark:bg-stone-800 px-4 py-2 text-[13px] font-bold text-stone-500">
                Completed · thank you!
              </div>
            )}
          </div>

          {/* progress rail */}
          <div className="mt-8 relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-stone-200 dark:bg-stone-800" aria-hidden />
            <motion.div
              className="absolute left-[19px] top-2 w-0.5 ember-gradient rounded-full"
              initial={false}
              animate={{ height: `${(idx / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ maxHeight: "calc(100% - 16px)" }}
              aria-hidden
            />
            <ol className="space-y-7">
              {steps.map((s, i) => {
                const I = s.icon;
                const done = i <= idx;
                const current = i === idx && order.status !== "completed";
                return (
                  <li key={s.key} className="flex gap-4 items-start relative">
                    <span
                      className={cn(
                        "w-10 h-10 rounded-full grid place-items-center border-2 shrink-0 z-10 transition-colors duration-500",
                        done ? "ember-gradient border-transparent text-white shadow-lift" : "bg-paper dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-300 dark:text-stone-600",
                      )}
                    >
                      {current ? <motion.span animate={{ rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}><I size={17} /></motion.span> : <I size={17} />}
                      {current && <span className="absolute inset-0 rounded-full ember-gradient animate-ping opacity-30" aria-hidden />}
                    </span>
                    <div className={cn("pt-1", !done && "opacity-45")}>
                      <p className="font-bold text-[15px]">{s.label}</p>
                      <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* receipt */}
        <div className="rounded-2xl bg-ink dark:bg-stone-900 text-paper shadow-lift p-6 relative overflow-hidden grain">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[12px] font-bold text-ember-400">KITCHEN TICKET · {order.code}</p>
            <span className="text-[11px] text-stone-400">{fmtTime(order.placedAt)}</span>
          </div>
          <div className="mt-4 border-t border-dashed border-white/20 pt-4">
            <p className="font-display text-lg font-bold">{order.customer.name}</p>
            <p className="text-[12px] text-stone-400 mt-0.5">{order.customer.phone}{order.address ? ` · ${order.address}` : ""}</p>
          </div>
          <ul className="mt-4 space-y-2.5">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm">
                <span><span className="font-mono font-bold text-ember-400 mr-2">{it.qty}×</span>{it.name}
                  {it.modifiers.length > 0 && <span className="block text-[11.5px] text-stone-400 ml-6">{it.modifiers.map((m) => m.name).join(" · ")}</span>}
                </span>
                <span className="font-mono text-stone-300">{money(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-dashed border-white/20 pt-3.5 space-y-1.5 text-[13px] font-mono">
            <div className="flex justify-between text-stone-400"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>{order.promoName}</span><span>−{money(order.discount)}</span></div>}
            {order.deliveryFee > 0 && <div className="flex justify-between text-stone-400"><span>Delivery</span><span>{money(order.deliveryFee)}</span></div>}
            <div className="flex justify-between text-stone-400"><span>Tip → staff</span><span>{money(order.tip)}</span></div>
            <div className="flex justify-between text-emerald-400 font-bold"><span>Platform fee</span><span>{money(order.platformFee)}</span></div>
            <div className="flex justify-between text-base font-bold text-white pt-1.5"><span>Total · {order.payment === "applepay" ? " Pay" : order.payment === "googlepay" ? "G Pay" : "Card"}</span><span>{money(order.total)}</span></div>
          </div>
          {order.notes && <p className="mt-4 text-[12px] italic text-stone-400 bg-white/5 rounded-lg px-3.5 py-2.5">“{order.notes}”</p>}
          <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="mt-5 flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-white/20 text-sm font-bold hover:border-ember-400 hover:text-ember-300 transition-colors">
            <Phone size={15} /> Something off? Call {RESTAURANT.phone}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
