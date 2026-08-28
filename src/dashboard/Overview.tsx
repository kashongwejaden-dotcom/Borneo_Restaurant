import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bike, Flame, Megaphone, Receipt, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CHANNEL_SPLIT, HOURLY_REVENUE, POPULAR_ITEMS } from "../lib/seed";
import { money, timeAgo, useFakeLoad, useCountUp, cn } from "../lib/utils";
import { useStore } from "../lib/store";
import { Button, Input, Skeleton, Sparkline } from "../components/ui";

const STATUS_TONE: Record<string, string> = {
  new: "bg-ember-500/15 text-ember-400",
  preparing: "bg-amber-500/15 text-amber-400",
  ready: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-stone-700/40 text-stone-400",
};

export default function Overview() {
  const loading = useFakeLoad(750);
  const orders = useStore((s) => s.orders);
  const promos = useStore((s) => s.promos);

  const liveRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const baseRevenue = useMemo(() => HOURLY_REVENUE.reduce((s, h) => s + h.revenue, 0), []);
  const baseOrders = useMemo(() => HOURLY_REVENUE.reduce((s, h) => s + h.orders, 0), []);
  const tips = useMemo(() => orders.reduce((s, o) => s + o.tip, 0), [orders]);
  const revenue = baseRevenue + liveRevenue;
  const orderCount = baseOrders + orders.length;
  const avgTicket = revenue / Math.max(1, orderCount);
  const livePromos = promos.filter((p) => p.active).length;

  const metrics = [
    {
      label: "Today's revenue", raw: revenue, fmt: (v: number) => money(v), delta: "+18.4% vs last Tue",
      icon: Wallet, iconCls: "bg-ember-500/15 text-ember-400",
      spark: [8, 11, 9, 14, 12, 17, 15, 21, 19, 24], sparkColor: "#f97316",
    },
    {
      label: "Orders", raw: orderCount, fmt: (v: number) => String(Math.round(v)), delta: `${orders.filter((o) => o.status === "new").length} waiting on the pass`,
      icon: Receipt, iconCls: "bg-amber-500/15 text-amber-400",
      spark: [3, 5, 4, 6, 5, 8, 7, 9, 8, 11], sparkColor: "#f59e0b",
    },
    {
      label: "Avg ticket", raw: avgTicket, fmt: (v: number) => money(v), delta: "+FRw 1,240 this week",
      icon: TrendingUp, iconCls: "bg-emerald-500/15 text-emerald-400",
      spark: [5.0, 5.2, 5.1, 5.4, 5.3, 5.6, 5.5, 5.7, 5.6, 5.8], sparkColor: "#10b981",
    },
    {
      label: "Tips → staff", raw: tips + 34000, fmt: (v: number) => money(v), delta: "100% paid out, zero skim",
      icon: Flame, iconCls: "bg-rose-500/15 text-rose-400",
      spark: [1.0, 2.0, 1.5, 2.5, 2.0, 3.0, 2.6, 3.4, 3.0, 4.0], sparkColor: "#f43f5e",
    },
  ];

  return (
    <div className="space-y-6">
      {/* metrics */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) =>
          loading ? (
            <Skeleton key={m.label} className="h-[128px]" />
          ) : (
            <MetricCard key={m.label} m={m} index={i} />
          ),
        )}
      </div>

      {/* storefront announcement — publishes straight to the live menu */}
      {!loading && <AnnouncementCard />}

      {/* charts */}
      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-4">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 sm:p-6">
          {loading ? (
            <Skeleton className="h-[280px]" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Revenue by hour</h2>
                  <p className="text-[12px] text-stone-500 mt-0.5">Peak at 6 PM — consider a Happy Hour push before it</p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-800/80 rounded-full px-3 py-1.5">Today</span>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_REVENUE} margin={{ top: 5, right: 5, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: "#78716c", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                    <Tooltip
                      cursor={{ stroke: "#f97316", strokeOpacity: 0.3 }}
                      contentStyle={{ background: "#1c1917", border: "1px solid #292524", borderRadius: 12, fontSize: 13 }}
                      labelStyle={{ color: "#a8a29e", fontWeight: 700 }}
                      formatter={(v: number, name: string) => [name === "revenue" ? money(v) : v, name === "revenue" ? "Revenue" : "Orders"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 sm:p-6">
          {loading ? (
            <Skeleton className="h-[280px]" />
          ) : (
            <>
              <h2 className="font-display text-lg font-bold text-white mb-1">Order channels</h2>
              <p className="text-[12px] text-stone-500 mb-4">Direct web orders — no aggregator in sight</p>
              <div className="flex items-center gap-6">
                <div className="w-[150px] h-[150px] relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CHANNEL_SPLIT} dataKey="value" innerRadius={52} outerRadius={72} paddingAngle={4} strokeWidth={0}>
                        {CHANNEL_SPLIT.map((c) => <Cell key={c.name} fill={c.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="font-display text-xl font-bold text-white leading-none">0%</p>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-stone-500 mt-1">commission</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-3 flex-1">
                  {CHANNEL_SPLIT.map((c) => (
                    <li key={c.name} className="flex items-center gap-2.5 text-[13px]">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                      <span className="text-stone-300 font-semibold flex-1">{c.name}</span>
                      <span className="font-mono font-bold text-white">{c.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-800">
                <p className="text-[12px] text-stone-500 mb-2.5 font-bold uppercase tracking-wider">Promotions running</p>
                <p className="text-[13.5px] text-stone-300">
                  <span className="font-bold text-ember-400">{livePromos}</span> active — Happy Hour drives the 3–5 PM shoulder.
                </p>
                <Link to="/dashboard/promos" className="inline-flex items-center gap-1.5 mt-2.5 text-[13px] font-bold text-ember-400 hover:text-ember-300">
                  Manage promos <ArrowRight size={13} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* popular + recent */}
      <div className="grid xl:grid-cols-[1fr_1.4fr] gap-4">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 sm:p-6">
          {loading ? <Skeleton className="h-[260px]" /> : (
            <>
              <h2 className="font-display text-lg font-bold text-white mb-5">Popular this week</h2>
              <ul className="space-y-4">
                {POPULAR_ITEMS.map((p, i) => (
                  <li key={p.name}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="font-semibold text-stone-200">{i + 1}. {p.name}</span>
                      <span className="font-mono text-stone-400">{p.count} sold</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div className="h-full ember-gradient rounded-full transition-all duration-700" style={{ width: `${(p.count / POPULAR_ITEMS[0].count) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 sm:p-6">
          {loading ? <Skeleton className="h-[260px]" /> : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white">Latest tickets</h2>
                <Link to="/dashboard/orders" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ember-400 hover:text-ember-300">
                  Open board <ArrowRight size={13} />
                </Link>
              </div>
              <ul className="divide-y divide-stone-800/80">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex items-center gap-4 py-3">
                    <span className="w-9 h-9 rounded-lg bg-stone-800/80 grid place-items-center text-stone-400 shrink-0">
                      {o.channel === "delivery" ? <Bike size={15} /> : <Flame size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold text-white font-mono">{o.code} <span className="text-stone-500 font-sans font-semibold">· {o.customer.name}</span></p>
                      <p className="text-[12px] text-stone-500 truncate">{o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""} · {timeAgo(o.placedAt)}</p>
                    </div>
                    <span className={cn("text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full", STATUS_TONE[o.status])}>{o.status}</span>
                    <span className="font-mono text-[13px] font-bold text-white w-[92px] text-right">{money(o.total)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- animated metric card ---------------- */

interface MetricDef {
  label: string;
  raw: number;
  fmt: (v: number) => string;
  delta: string;
  icon: LucideIcon;
  iconCls: string;
  spark: number[];
  sparkColor: string;
}

/* ---------------- storefront announcement ---------------- */

function AnnouncementCard() {
  const announcement = useStore((s) => s.announcement);
  const setAnnouncement = useStore((s) => s.setAnnouncement);
  const toast = useStore((s) => s.toast);
  const [draft, setDraft] = useState(announcement);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4.5 p-5 flex flex-col sm:flex-row gap-3.5 sm:items-center"
    >
      <span className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center shrink-0">
        <Megaphone size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-amber-400">Storefront note — “From the kitchen”</p>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Rendang is back for the weekend — first 20 orders get free krupuk"
          className="mt-2 h-10 bg-stone-950/70 border-stone-700/80"
          aria-label="Storefront announcement"
        />
      </div>
      <div className="flex gap-2.5 shrink-0">
        <Button
          variant="line"
          size="sm"
          className="h-10"
          onClick={() => { setDraft(""); setAnnouncement(""); toast("Note removed from the storefront", "info"); }}
        >
          Clear
        </Button>
        <Button
          size="sm"
          className="h-10"
          onClick={() => { setAnnouncement(draft); toast(draft.trim() ? "Note published to the live menu" : "Note removed from the storefront"); }}
        >
          Publish
        </Button>
      </div>
    </motion.div>
  );
}

function MetricCard({ m, index }: { m: MetricDef; index: number }) {
  const v = useCountUp(m.raw);
  const I = m.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
      className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 hover:border-stone-600 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-stone-500">{m.label}</span>
        <span className={cn("w-9 h-9 rounded-lg grid place-items-center transition-transform duration-300 group-hover:scale-110", m.iconCls)}>
          <I size={16} />
        </span>
      </div>
      <div className="mt-3.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[27px] font-bold text-white leading-none tabular-nums">{m.fmt(v)}</p>
          <p className="text-[12px] text-stone-500 mt-2.5 truncate">{m.delta}</p>
        </div>
        <Sparkline data={m.spark} className="w-[88px] h-8 shrink-0 opacity-0 group-hover:opacity-90 transition-opacity duration-500" stroke={m.sparkColor} />
      </div>
    </motion.div>
  );
}
