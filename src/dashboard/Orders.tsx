import { useEffect, useMemo, useState } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors, useDraggable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, ArrowRight, Bike, Chrome, CreditCard, Flame, GripVertical, Inbox, MapPin, Phone, X } from "lucide-react";
import type { Order, OrderStatus } from "../lib/types";
import { cn, fmtTime, money, timeAgo } from "../lib/utils";
import { useStore } from "../lib/store";
import { Badge, Button, Modal } from "../components/ui";

const COLUMNS: { id: OrderStatus; label: string; accent: string; dot: string }[] = [
  { id: "new", label: "New", accent: "text-ember-400", dot: "bg-ember-500" },
  { id: "preparing", label: "Preparing", accent: "text-amber-400", dot: "bg-amber-400" },
  { id: "ready", label: "Ready", accent: "text-emerald-400", dot: "bg-emerald-400" },
  { id: "completed", label: "Completed", accent: "text-stone-400", dot: "bg-stone-500" },
];

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { new: "preparing", preparing: "ready", ready: "completed" };

export default function OrdersBoard() {
  const orders = useStore((s) => s.orders);
  const setOrderStatus = useStore((s) => s.setOrderStatus);
  const toast = useStore((s) => s.toast);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStatus = useMemo(() => {
    const m: Record<OrderStatus, Order[]> = { new: [], preparing: [], ready: [], completed: [] };
    [...orders].sort((a, b) => b.placedAt - a.placedAt).forEach((o) => m[o.status].push(o));
    return m;
  }, [orders]);

  const activeOrder = activeId ? orders.find((o) => o.id === activeId) ?? null : null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const over = e.over?.id as OrderStatus | undefined;
    const id = String(e.active.id);
    if (over && orders.find((o) => o.id === id)?.status !== over) {
      setOrderStatus(id, over);
      const col = COLUMNS.find((c) => c.id === over);
      toast(`${orders.find((o) => o.id === id)?.code} → ${col?.label}`, "info");
    }
  };

  // keep detail modal in sync with live status changes
  useEffect(() => {
    if (detail) setDetail(orders.find((o) => o.id === detail.id) ?? null);
  }, [orders]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-[13px] text-stone-400">
          Drag tickets between stages — the customer's tracking page updates <span className="text-ember-400 font-semibold">instantly</span>.
        </p>
        <span className="text-[11.5px] font-bold uppercase tracking-wider text-stone-500 font-mono">{orders.length} tickets today</span>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => (
            <Column key={col.id} col={col} orders={byStatus[col.id]} onOpen={setDetail} dimmed={!!activeId && activeOrder?.status !== col.id} />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease-out" }}>
          {activeOrder ? <OrderCard order={activeOrder} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <TicketModal order={detail} onClose={() => setDetail(null)} onAdvance={(o) => {
        const next = NEXT[o.status];
        if (next) {
          setOrderStatus(o.id, next);
          toast(`${o.code} → ${COLUMNS.find((c) => c.id === next)?.label}`, "info");
        }
      }} />
    </div>
  );
}

/* ---------------- column ---------------- */

function Column({ col, orders, onOpen, dimmed }: { col: (typeof COLUMNS)[number]; orders: Order[]; onOpen: (o: Order) => void; dimmed: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border bg-stone-900/50 transition-all duration-200",
        isOver ? "border-ember-500/70 bg-ember-500/5 scale-[1.01]" : "border-stone-800",
        dimmed && "opacity-90",
      )}
    >
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <span className={cn("w-2 h-2 rounded-full", col.dot, col.id !== "completed" && "animate-ember-pulse")} />
        <h2 className={cn("font-display text-[17px] font-bold", col.accent)}>{col.label}</h2>
        <span className="ml-auto font-mono text-[12px] font-bold text-stone-500 bg-stone-800/80 rounded-full px-2.5 py-1">{orders.length}</span>
      </div>
      <div className="px-3 pb-3 space-y-2.5 min-h-[160px]">
        <AnimatePresence initial={false}>
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} onOpen={() => onOpen(o)} />
          ))}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-stone-800 text-center py-8 text-[12px] font-semibold text-stone-600">
            <Inbox size={18} className="mx-auto mb-2 text-stone-700" />
            Drop tickets here
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- card ---------------- */

function OrderCard({ order, onOpen, overlay }: { order: Order; onOpen?: () => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: order.id });
  const minsLeft = Math.max(0, Math.round((order.eta - Date.now()) / 60000));
  const urgent = order.status !== "completed" && minsLeft < 5;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen?.()}
        aria-label={`Open ticket ${order.code}`}
        className={cn(
          "rounded-xl border bg-stone-950/90 p-3.5 cursor-grab active:cursor-grabbing select-none group",
          overlay ? "border-ember-500/70 shadow-lift rotate-2 scale-[1.03]" : "border-stone-800 hover:border-stone-600 transition-colors",
        )}
      >
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-stone-700 group-hover:text-stone-500 shrink-0" />
          <span className="font-mono text-[12.5px] font-bold text-white">{order.code}</span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-stone-500">
            {order.channel === "delivery" ? <Bike size={12} className="text-ember-400" /> : <Flame size={12} className="text-ember-400" />}
            {order.channel}
          </span>
          <span className={cn("ml-auto text-[11px] font-mono font-bold", urgent ? "text-red-400" : "text-stone-500")}>
            {order.status === "completed" ? fmtTime(order.placedAt) : `${minsLeft}m`}
          </span>
        </div>
        <p className="mt-2 text-[13px] font-semibold text-stone-200 leading-snug">
          {order.items[0]?.name} ×{order.items[0]?.qty}
          {order.items.length > 1 && <span className="text-stone-500"> +{order.items.length - 1} more</span>}
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[12px] text-stone-500">{order.customer.name} · {timeAgo(order.placedAt)}</span>
          <span className="font-mono text-[12.5px] font-bold text-ember-400">{money(order.total)}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- ticket detail modal ---------------- */

function TicketModal({ order, onClose, onAdvance }: { order: Order | null; onClose: () => void; onAdvance: (o: Order) => void }) {
  const next = order ? NEXT[order.status] : undefined;
  return (
    <Modal open={!!order} onClose={onClose} label="Ticket detail" wide>
      {order && (
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xl font-bold text-ink dark:text-white">{order.code}</h2>
              <Badge tone={order.status === "new" ? "ember" : order.status === "preparing" ? "amber" : order.status === "ready" ? "green" : "neutral"}>
                {order.status}
              </Badge>
              <Badge tone="neutral">{order.channel}</Badge>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800"><X size={17} /></button>
          </div>

          <div className="mt-6 grid sm:grid-cols-[1.3fr_1fr] gap-6">
            {/* items */}
            <div className="rounded-xl bg-stone-950 text-paper p-5 grain relative overflow-hidden">
              <p className="font-mono text-[11px] font-bold text-ember-400 uppercase tracking-wider mb-3.5">Kitchen ticket</p>
              <ul className="space-y-3">
                {order.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-3 text-sm">
                    <span>
                      <span className="font-mono font-bold text-ember-400 mr-2">{it.qty}×</span>{it.name}
                      {it.modifiers.length > 0 && <span className="block text-[12px] text-stone-400 ml-6 mt-0.5">{it.modifiers.map((m) => m.name).join(" · ")}</span>}
                    </span>
                    <span className="font-mono text-stone-300 whitespace-nowrap">{money(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3.5 border-t border-dashed border-white/20 space-y-1.5 text-[13px] font-mono">
                {order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>{order.promoName}</span><span>−{money(order.discount)}</span></div>}
                {order.deliveryFee > 0 && <div className="flex justify-between text-stone-400"><span>Delivery</span><span>{money(order.deliveryFee)}</span></div>}
                <div className="flex justify-between text-stone-400"><span>Tip → staff</span><span>{money(order.tip)}</span></div>
                <div className="flex justify-between font-bold text-white text-[15px] pt-1"><span>Paid · {order.payment === "applepay" ? "Apple Pay" : order.payment === "googlepay" ? "Google Pay" : "Card"}</span><span>{money(order.total)}</span></div>
                <p className="text-[11px] text-emerald-400/80 font-sans font-semibold">✓ Settled direct to restaurant bank account — FRw 0 commission</p>
              </div>
            </div>

            {/* customer */}
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 dark:border-stone-700 p-4.5 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">Customer</p>
                <p className="font-bold text-[15px]">{order.customer.name}</p>
                <div className="mt-2.5 space-y-2 text-[13px] text-stone-500 dark:text-stone-400">
                  <p className="flex items-center gap-2.5"><Phone size={14} className="text-ember-500" />{order.customer.phone}</p>
                  {order.address && <p className="flex items-start gap-2.5"><MapPin size={14} className="text-ember-500 mt-0.5 shrink-0" />{order.address}</p>}
                  <p className="flex items-center gap-2.5"><Flame size={14} className="text-ember-500" />Placed {timeAgo(order.placedAt)} · ETA {fmtTime(order.eta)}</p>
                </div>
                {order.notes && (
                  <p className="mt-3.5 text-[12.5px] italic bg-stone-100 dark:bg-stone-800 rounded-lg px-3.5 py-2.5 text-stone-600 dark:text-stone-300">“{order.notes}”</p>
                )}
              </div>

              <div className="rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">Move this ticket</p>
                <div className="flex flex-col gap-2.5">
                  {next ? (
                    <Button onClick={() => onAdvance(order)}>
                      Advance → {next === "preparing" ? "Start preparing" : next === "ready" ? (order.channel === "delivery" ? "Send out for delivery" : "Mark ready for pickup") : "Complete order"}
                      <ArrowRight size={15} />
                    </Button>
                  ) : (
                    <p className="text-[13px] text-stone-500">Order complete. Nice work, chef. 👨🏾‍🍳</p>
                  )}
                  <p className="text-[11.5px] text-stone-400 leading-relaxed">Or drag the card on the board — the customer sees the change in real time.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[12px] text-stone-400">
                {order.payment === "applepay" ? <Apple size={14} /> : order.payment === "googlepay" ? <Chrome size={14} className="text-ember-500" /> : <CreditCard size={14} className="text-ember-500" />}
                Processed by Stripe Connect · payout lands in 1–2 business days
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
