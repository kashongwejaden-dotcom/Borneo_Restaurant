import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Phone, Users, X, Check } from "lucide-react";
import type { Reservation } from "../lib/types";
import { cn, todayISO } from "../lib/utils";
import { useStore } from "../lib/store";
import { Badge, Button } from "../components/ui";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ReservationsPage() {
  const reservations = useStore((s) => s.reservations);
  const setStatus = useStore((s) => s.setReservationStatus);
  const toast = useStore((s) => s.toast);

  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(todayISO(0));

  const byDate = useMemo(() => {
    const m = new Map<string, Reservation[]>();
    reservations.forEach((r) => {
      if (!m.has(r.date)) m.set(r.date, []);
      m.get(r.date)!.push(r);
    });
    m.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return m;
  }, [reservations]);

  const cells = useMemo(() => {
    const first = new Date(month);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const start = new Date(first);
    start.setDate(1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const p = (n: number) => String(n).padStart(2, "0");
      return { iso: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, day: d.getDate(), inMonth: d.getMonth() === month.getMonth() };
    });
  }, [month]);

  const dayList = (byDate.get(selected) ?? []).filter((r) => r.status !== "cancelled" || true);
  const todayCount = (byDate.get(todayISO(0)) ?? []).filter((r) => r.status !== "cancelled").length;
  const upcomingCount = reservations.filter((r) => r.status === "upcoming" && r.date >= todayISO(0)).length;
  const seatedCount = reservations.filter((r) => r.status === "seated").length;

  return (
    <div className="grid xl:grid-cols-[1.5fr_1fr] gap-6 items-start">
      {/* calendar */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-white capitalize">
              {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <p className="text-[12px] text-stone-500 mt-0.5">{todayCount} covers booked today · {upcomingCount} upcoming</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="w-10 h-10 grid place-items-center rounded-lg border border-stone-700 text-stone-300 hover:border-ember-500 hover:text-ember-400 transition-colors"><ChevronLeft size={17} /></button>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="w-10 h-10 grid place-items-center rounded-lg border border-stone-700 text-stone-300 hover:border-ember-500 hover:text-ember-400 transition-colors"><ChevronRight size={17} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAYS.map((d) => <span key={d} className="text-center text-[10.5px] font-bold uppercase tracking-wider text-stone-500 py-1.5">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((c) => {
            const list = (byDate.get(c.iso) ?? []).filter((r) => r.status !== "cancelled");
            const isSel = c.iso === selected;
            const isToday = c.iso === todayISO(0);
            return (
              <button
                key={c.iso}
                onClick={() => setSelected(c.iso)}
                aria-pressed={isSel}
                className={cn(
                  "relative rounded-xl border aspect-square sm:aspect-[1.15] p-1.5 sm:p-2 text-left transition-all flex flex-col",
                  isSel ? "border-ember-500 bg-ember-500/10" : "border-stone-800 hover:border-stone-600 bg-stone-950/40",
                  !c.inMonth && "opacity-35",
                )}
              >
                <span className={cn("text-[12px] font-bold font-mono", isToday ? "text-ember-400" : "text-stone-300")}>{c.day}</span>
                {isToday && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-ember-400" />}
                <span className="mt-auto flex flex-col gap-1">
                  {list.slice(0, 2).map((r) => (
                    <span key={r.id} className={cn("hidden sm:block text-[10px] font-bold rounded-md px-1.5 py-0.5 truncate", r.status === "seated" ? "bg-emerald-500/15 text-emerald-400" : "bg-stone-800 text-stone-300")}>
                      {r.time} · {r.name.split(" ")[0]}
                    </span>
                  ))}
                  {list.length > 2 && <span className="hidden sm:block text-[10px] text-stone-500 font-bold">+{list.length - 2} more</span>}
                  {list.length > 0 && <span className="sm:hidden flex gap-0.5">{list.slice(0, 3).map((r) => <span key={r.id} className="w-1 h-1 rounded-full bg-ember-400" />)}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* day panel */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5 sm:p-6 xl:sticky xl:top-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-white capitalize flex items-center gap-2">
            <CalendarDays size={16} className="text-ember-400" />
            {new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </h3>
          <span className="font-mono text-[12px] text-stone-500">{dayList.length} bookings</span>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          <Badge tone="ember">{upcomingCount} upcoming</Badge>
          <Badge tone="green">{seatedCount} seated</Badge>
          <Badge tone="neutral">{todayCount} today</Badge>
        </div>

        {dayList.length === 0 ? (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-stone-800">
            <CalendarDays size={20} className="mx-auto text-stone-700 mb-2.5" />
            <p className="text-[13px] font-semibold text-stone-500">No bookings this day — yet.</p>
            <p className="text-[12px] text-stone-600 mt-1">New reservations from the storefront appear here instantly.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {dayList.map((r, i) => (
              <motion.li key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={cn("rounded-xl border p-4", r.status === "cancelled" ? "border-stone-800 bg-stone-950/40 opacity-50" : "border-stone-800 bg-stone-950/60 hover:border-stone-600 transition-colors")}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[15px] font-bold text-ember-400 w-[52px]">{r.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] text-white truncate">{r.name}</p>
                    <p className="text-[12px] text-stone-500 flex items-center gap-2.5 mt-0.5">
                      <span className="flex items-center gap-1"><Users size={11} /> {r.party}</span>
                      <span className="flex items-center gap-1"><Phone size={11} /> {r.phone}</span>
                    </p>
                  </div>
                  <Badge tone={r.status === "seated" ? "green" : r.status === "cancelled" ? "red" : "neutral"}>{r.status}</Badge>
                </div>
                {r.requests && <p className="mt-2.5 text-[12px] italic text-stone-400 bg-stone-800/60 rounded-lg px-3 py-2">“{r.requests}”</p>}
                {r.status !== "cancelled" && (
                  <div className="mt-3 flex gap-2">
                    {r.status === "upcoming" && (
                      <Button size="sm" onClick={() => { setStatus(r.id, "seated"); toast(`${r.name} checked in — table of ${r.party}`); }}>
                        <Check size={13} /> Check in
                      </Button>
                    )}
                    <Button size="sm" variant="line" className="hover:!border-red-500 hover:!text-red-400" onClick={() => { setStatus(r.id, "cancelled"); toast(`${r.name}'s booking cancelled`, "info"); }}>
                      <X size={13} /> Cancel
                    </Button>
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
