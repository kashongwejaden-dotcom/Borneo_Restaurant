import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bike, Flame, Receipt, TrendingUp, Wallet } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CHANNEL_SPLIT, HOURLY_REVENUE, POPULAR_ITEMS } from "../lib/seed";
import { money, timeAgo, useFakeLoad, cn } from "../lib/utils";
import { useStore } from "../lib/store";
import { Skeleton } from "../components/ui";

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
    { label: "Today's revenue", value: money(revenue), delta: "+18.4% vs last Tue", icon: Wallet, iconCls: "bg-ember-500/15 text-ember-400" },
    { label: "Orders", value: String(orderCount), delta: `${orders.filter((o) => o.status === "new").length} waiting on the pass`, icon: Receipt, iconCls: "bg-amber-500/15 text-amber-400" },
    { label: "Avg ticket", value: money(avgTicket), delta: "+FRw 1,240 this week", icon: TrendingUp, iconCls: "bg-emerald-500/15 text-emerald-400" },
    { label: "Tips → staff", value: money(tips + 34000), delta: "100% paid out, zero skim", icon: Flame, iconCls: "bg-rose-500/15 text-rose-400" },
  ];

  return (
    <div className="space-y-6">
      {/* metrics */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const I = m.icon;
          return loading ? (
            <Skeleton key={m.label} className="h-[124px]" />
          ) : (
            <div key={m.label} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 hover:border-stone-700 transition-colors group" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-stone-500">{m.label}</span>
                <span className={cn("w-9 h-9 rounded-lg grid place-items-center", m.iconCls)}><I size={16} /></span>
              </div>
              <p className="font-display text-[28px] font-bold text-white mt-3 leading-none">{m.value}</p>
              <p className="text-[12px] text-stone-500 mt-2.5">{m.delta}</p>
            </div>
          );
        })}
      </div>

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
