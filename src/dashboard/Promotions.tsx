import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Percent, Plus, Trash2, Ticket } from "lucide-react";
import type { Promotion } from "../lib/types";
import { cn, fromLocalInput, isPromoLive, promoWindow, toLocalInput } from "../lib/utils";
import { useStore } from "../lib/store";
import { Badge, Button, Field, Input, Switch } from "../components/ui";

function promoState(p: Promotion): { label: string; tone: "green" | "amber" | "neutral" | "red" } {
  const now = Date.now();
  if (!p.active) return { label: "Paused", tone: "neutral" };
  if (isPromoLive(p)) return { label: "Live now", tone: "green" };
  if (p.start > now) return { label: "Scheduled", tone: "amber" };
  return { label: "Ended", tone: "red" };
}

export default function Promotions() {
  const promos = useStore((s) => s.promos);
  const addPromo = useStore((s) => s.addPromo);
  const togglePromo = useStore((s) => s.togglePromo);
  const removePromo = useStore((s) => s.removePromo);
  const toast = useStore((s) => s.toast);

  const [name, setName] = useState("");
  const [percent, setPercent] = useState("15");
  const [start, setStart] = useState(() => toLocalInput(Date.now() + 60 * 60 * 1000));
  const [end, setEnd] = useState(() => toLocalInput(Date.now() + 3 * 60 * 60 * 1000));
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = Number(percent);
    if (!name.trim()) return setError("Give the promotion a name — it shows on the customer's receipt.");
    if (!pct || pct < 1 || pct > 90) return setError("Discount must be between 1% and 90%.");
    const s = fromLocalInput(start);
    const en = fromLocalInput(end);
    if (Number.isNaN(s) || Number.isNaN(en)) return setError("Both start and end times are required.");
    if (en <= s) return setError("End time must be after the start time.");
    addPromo({ name: name.trim(), percent: pct, start: s, end: en, active: true });
    toast(`“${name.trim()}” created — applies automatically at checkout`);
    setName("");
    setError("");
  };

  const liveCount = promos.filter((p) => isPromoLive(p)).length;

  return (
    <div className="grid xl:grid-cols-[1fr_1.25fr] gap-6 items-start">
      {/* create form */}
      <form onSubmit={submit} className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6 xl:sticky xl:top-24">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="w-10 h-10 rounded-xl ember-gradient text-white grid place-items-center"><Ticket size={18} /></span>
          <div>
            <h2 className="font-display text-xl font-bold text-white">New promotion</h2>
            <p className="text-[12px] text-stone-500">Time-based discount, applied automatically at checkout.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Promotion name">
            <Input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Happy Hour · Sate Happy Hour · Early Bird…" />
          </Field>
          <Field label="Discount percentage">
            <div className="relative">
              <Percent size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <Input
                className="pl-10"
                inputMode="numeric"
                value={percent}
                onChange={(e) => { setPercent(e.target.value.replace(/\D/g, "").slice(0, 2)); setError(""); }}
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Starts">
              <Input type="datetime-local" value={start} onChange={(e) => { setStart(e.target.value); setError(""); }} className="[color-scheme:dark]" />
            </Field>
            <Field label="Ends">
              <Input type="datetime-local" value={end} onChange={(e) => { setEnd(e.target.value); setError(""); }} className="[color-scheme:dark]" />
            </Field>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-[12.5px] font-semibold text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5">
              {error}
            </motion.p>
          )}

          <Button type="submit" size="lg" className="w-full"><Plus size={16} /> Launch promotion</Button>
          <p className="text-[11.5px] text-stone-500 leading-relaxed text-center">
            Customers see a banner on the menu and the discount line on their receipt — no coupon codes to fumble with.
          </p>
        </div>
      </form>

      {/* list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-stone-400">All promotions</h3>
          <Badge tone={liveCount > 0 ? "green" : "neutral"}><Flame size={11} /> {liveCount} live now</Badge>
        </div>
        <div className="space-y-3.5">
          {promos.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-stone-800 py-14 text-center">
              <Ticket size={22} className="mx-auto text-stone-700 mb-3" />
              <p className="text-sm font-semibold text-stone-500">No promotions yet. Launch your first on the left.</p>
            </div>
          )}
          {promos.map((p, i) => {
            const st = promoState(p);
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn("rounded-2xl border p-5 flex flex-wrap items-center gap-4", isPromoLive(p) ? "border-ember-500/50 bg-ember-500/5" : "border-stone-800 bg-stone-900/50", !p.active && "opacity-60")}
              >
                <span className={cn("w-12 h-12 rounded-xl grid place-items-center shrink-0", isPromoLive(p) ? "ember-gradient text-white" : "bg-stone-800 text-stone-400")}>
                  <span className="font-display text-[15px] font-bold leading-none">−{p.percent}%</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-bold text-[15px] text-white">{p.name}</p>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <p className="text-[12px] text-stone-500 font-mono mt-1">{promoWindow(p)}</p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-500">{p.active ? "On" : "Off"}</span>
                    <Switch checked={p.active} onChange={() => { togglePromo(p.id); toast(`${p.name} ${p.active ? "paused" : "resumed"}`, "info"); }} label={`Toggle ${p.name}`} size="sm" />
                  </div>
                  <button
                    onClick={() => { removePromo(p.id); toast(`${p.name} deleted`, "info"); }}
                    aria-label={`Delete ${p.name}`}
                    className="w-10 h-10 grid place-items-center rounded-lg border border-stone-700 text-stone-500 hover:border-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
