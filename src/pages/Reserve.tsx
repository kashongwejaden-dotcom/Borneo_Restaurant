import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Check, Clock, Mail, MapPin, PartyPopper, Phone, Users } from "lucide-react";
import { cn, prettyDate, todayISO } from "../lib/utils";
import { useStore } from "../lib/store";
import { Button, Field, Input, Textarea } from "../components/ui";
import { Footer, QtyStepper, Reveal } from "../components/shared";
import { IMG, RESTAURANT } from "../lib/seed";

const LUNCH = ["12:00", "12:30", "13:00", "13:30"];
const DINNER = ["18:00", "18:30", "19:00", "19:30", "20:00"];

export default function Reserve() {
  const reservations = useStore((s) => s.reservations);
  const addReservation = useStore((s) => s.addReservation);
  const toast = useStore((s) => s.toast);
  const user = useStore((s) => s.user);

  const [date, setDate] = useState(todayISO(0));
  const [time, setTime] = useState<string | null>(null);
  const [party, setParty] = useState(2);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [confirmed, setConfirmed] = useState<{ date: string; time: string; party: number } | null>(null);

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => todayISO(i)), []);

  const taken = useMemo(
    () =>
      new Set(
        reservations
          .filter((r) => r.date === date && r.status !== "cancelled")
          .map((r) => r.time),
      ),
    [reservations, date],
  );

  const isToday = date === todayISO(0);
  const nowHM = new Date().toTimeString().slice(0, 5);
  const slotDisabled = (t: string) => taken.has(t) || (isToday && t <= nowHM);

  const submit = () => {
    if (!time) return toast("Pick a time slot first.", "error");
    if (!name.trim() || !phone.trim()) return toast("We need a name and phone to hold the table.", "error");
    addReservation({ name: name.trim(), phone: phone.trim(), party, date, time, requests: requests.trim() || undefined });
    setConfirmed({ date, time, party });
    toast("Table reserved — confirmation email sent via Resend");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="grid lg:grid-cols-[1fr_1.25fr] gap-12 items-start">
        {/* left: ambience + info */}
        <Reveal>
          <div className="relative rounded-[24px] overflow-hidden grain lg:sticky lg:top-24">
            <img src={IMG.interior} alt="Inside Borneo — rattan lamps and warm wood" className="w-full aspect-[4/4.4] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" aria-hidden />
            <div className="absolute bottom-0 inset-x-0 p-7 text-paper">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ember-400 mb-2.5 flex items-center gap-2"><CalendarDays size={13} /> Book a table</p>
              <h1 className="font-display text-4xl font-bold leading-[1.05]">Dinner by the<br /><span className="italic text-ember-300">open fire.</span></h1>
              <div className="mt-5 space-y-2.5 text-[13.5px] text-stone-300">
                <p className="flex items-center gap-2.5"><Clock size={15} className="text-ember-400" /> {RESTAURANT.hours}</p>
                <p className="flex items-center gap-2.5"><MapPin size={15} className="text-ember-400" /> {RESTAURANT.address}</p>
                <p className="flex items-center gap-2.5"><Phone size={15} className="text-ember-400" /> {RESTAURANT.phone}</p>
                <p className="flex items-center gap-2.5"><Users size={15} className="text-ember-400" /> Parties up to 8 online · larger groups call us</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* right: widget */}
        <div>
          {confirmed ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-emerald-300/60 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }} className="mx-auto w-16 h-16 rounded-full bg-emerald-500 text-white grid place-items-center shadow-lift">
                <PartyPopper size={28} />
              </motion.div>
              <h2 className="font-display text-3xl font-bold mt-5">Table held. See you soon!</h2>
              <p className="mt-3 text-stone-600 dark:text-stone-300">
                <span className="font-bold">{prettyDate(confirmed.date)}</span> at <span className="font-bold">{confirmed.time}</span> · party of <span className="font-bold">{confirmed.party}</span>
              </p>
              <p className="mt-3 text-[13px] text-stone-500 flex items-center justify-center gap-2">
                <Mail size={14} className="text-emerald-500" /> Confirmation + reminder email sent via Resend
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Button variant="outline" onClick={() => { setConfirmed(null); setTime(null); setRequests(""); }}>Book another</Button>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</Button>
              </div>
            </motion.div>
          ) : (
            <Reveal delay={0.1}>
              <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-8">
                <h2 className="font-display text-3xl font-bold">Reserve in seconds</h2>
                <p className="text-sm text-stone-500 mt-1.5">Live availability — slots cross out the moment they're taken.</p>

                {/* date strip */}
                <p className="mt-7 text-[12px] font-bold uppercase tracking-wider text-stone-400 mb-2.5">Date</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5">
                  {days.map((d) => {
                    const dt = new Date(d + "T12:00:00");
                    const sel = d === date;
                    return (
                      <button
                        key={d}
                        onClick={() => { setDate(d); setTime(null); }}
                        aria-pressed={sel}
                        className={cn(
                          "shrink-0 w-[64px] rounded-xl border py-2.5 text-center transition-all",
                          sel ? "ember-gradient text-white border-transparent shadow-lift" : "border-stone-200 dark:border-stone-700 hover:border-ember-400 text-stone-600 dark:text-stone-300",
                        )}
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">{dt.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <span className="block text-lg font-bold font-mono mt-0.5">{dt.getDate()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* time slots */}
                <p className="mt-6 text-[12px] font-bold uppercase tracking-wider text-stone-400 mb-2.5">Time · {prettyDate(date)}</p>
                {[{ label: "Lunch", slots: LUNCH }, { label: "Dinner", slots: DINNER }].map((g) => (
                  <div key={g.label} className="mb-3.5">
                    <span className="text-[11px] font-bold text-stone-400 uppercase">{g.label}</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {g.slots.map((t) => {
                        const dis = slotDisabled(t);
                        const sel = time === t;
                        return (
                          <button
                            key={t}
                            disabled={dis}
                            onClick={() => setTime(t)}
                            aria-pressed={sel}
                            className={cn(
                              "px-4 h-10 rounded-lg text-[13.5px] font-bold font-mono border transition-all",
                              sel && "ember-gradient text-white border-transparent shadow-lift",
                              !sel && !dis && "border-stone-200 dark:border-stone-700 hover:border-ember-400 text-stone-600 dark:text-stone-300",
                              dis && "border-stone-200 dark:border-stone-800 text-stone-300 dark:text-stone-700 line-through cursor-not-allowed bg-stone-100/60 dark:bg-stone-900/60",
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* party + details */}
                <div className="mt-5 flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-wider text-stone-400 mb-2">Party size</p>
                    <QtyStepper qty={party} onChange={(d) => setParty((p) => Math.min(8, Math.max(1, p + d)))} />
                  </div>
                  <p className="text-[12.5px] text-stone-400 max-w-[200px] leading-snug">
                    {party >= 8 ? "For 8+ guests call us and we'll push tables together." : "Kids welcome — high chairs on request."}
                  </p>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <Field label="Name on the booking"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aline Uwase" /></Field>
                  <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" /></Field>
                </div>
                <div className="mt-4">
                  <Field label="Special requests"><Textarea value={requests} onChange={(e) => setRequests(e.target.value)} placeholder="Birthday, allergies, window seat…" /></Field>
                </div>

                <Button size="lg" className="w-full mt-7" onClick={submit} disabled={!time}>
                  {time ? <>Hold table · {prettyDate(date)} at {time}</> : "Select a time to continue"}
                </Button>
                <p className="mt-3 text-[12px] text-stone-400 text-center">Free to book · we hold the table 15 minutes past your slot</p>
              </div>
            </Reveal>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
