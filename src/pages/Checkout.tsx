import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Apple, ArrowRight, Bike, Check, Chrome, CreditCard, Flame, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { cn, money, uid } from "../lib/utils";
import { useCartTotal, useLivePromo, useStore } from "../lib/store";
import { Button, Field, Input, Segmented, Skeleton, Textarea } from "../components/ui";
import { Footer } from "../components/shared";
import { RESTAURANT } from "../lib/seed";

type PayMethod = "card" | "applepay" | "googlepay";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useStore((s) => s.cart);
  const user = useStore((s) => s.user);
  const accepting = useStore((s) => s.accepting);
  const placeOrder = useStore((s) => s.placeOrder);
  const toast = useStore((s) => s.toast);
  const promo = useLivePromo();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [channel, setChannel] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [tipPct, setTipPct] = useState<number>(12.5);
  const [customTip, setCustomTip] = useState("");
  const [pay, setPay] = useState<PayMethod>("applepay");
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);

  const subtotal = useCartTotal();
  const discount = promo ? Math.round((subtotal * promo.percent) / 100) : 0;
  const deliveryFee = channel === "delivery" ? 2000 : 0;
  const tip = customTip !== "" ? Math.max(0, Number(customTip) || 0) : Math.round((subtotal * tipPct) / 100);
  const total = subtotal - discount + deliveryFee + tip;

  /* celebration burst when the ticket hits the pass */
  useEffect(() => {
    if (!done) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const fire = () =>
      confetti({
        particleCount: 80,
        spread: 78,
        origin: { y: 0.32 },
        colors: ["#f97316", "#ea580c", "#fbbf24", "#fde68a", "#ffffff"],
        ticks: 210,
        scalar: 0.9,
      });
    fire();
    const t = setTimeout(fire, 260);
    return () => clearTimeout(t);
  }, [done]);

  if (done) {
    return (
      <div className="min-h-[80vh] grid place-items-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 16 }}
            className="mx-auto w-20 h-20 rounded-full bg-emerald-500 text-white grid place-items-center shadow-lift"
          >
            <Check size={36} strokeWidth={3} />
          </motion.div>
          <h1 className="font-display text-4xl font-bold mt-6">Order fired to the kitchen</h1>
          <p className="mt-3 text-stone-500 dark:text-stone-400 leading-relaxed">
            Ticket <span className="font-mono font-bold text-ink dark:text-stone-100">{done.code}</span> is on the pass.
            A confirmation email is on its way{email ? ` to ${email}` : ""}.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-4 py-2">
            <ShieldCheck size={15} /> Paid via Stripe · FRw 0 platform fee · {RESTAURANT.name} receives 100%
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" onClick={() => navigate(`/track/${done.code}`)}>Track it live <ArrowRight size={16} /></Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/menu")}>Order more</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-ember-500/10 text-ember-500 grid place-items-center mb-4"><ShoppingBag size={26} /></div>
          <h1 className="font-display text-3xl font-bold">Your order is empty</h1>
          <p className="mt-2 text-stone-500">Fill it with something smoky first.</p>
          <Button size="lg" className="mt-6" onClick={() => navigate("/menu")}>Browse the live menu</Button>
        </div>
      </div>
    );
  }

  const submit = () => {
    if (!name.trim() || !phone.trim()) return toast("Name and phone are required so the kitchen can reach you.", "error");
    if (channel === "delivery" && !address.trim()) return toast("Delivery needs an address.", "error");
    if (pay === "card" && (card.num.replace(/\s/g, "").length < 12)) return toast("Enter a valid card number (demo — any digits work).", "error");
    setProcessing(true);
    setTimeout(() => {
      const order = placeOrder({
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
        channel,
        address: channel === "delivery" ? address.trim() : undefined,
        notes: notes.trim() || undefined,
        tip,
        payment: pay,
      });
      setProcessing(false);
      setDone({ code: order.code });
      toast(`Payment approved · ${order.code}`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
        <ShieldCheck size={15} className="text-emerald-500" /> Guest checkout — no account needed. Payments handled by Stripe, straight to {RESTAURANT.name}.
      </p>

      {!accepting && (
        <div className="mt-6 rounded-xl border border-red-300/60 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-5 py-3.5 text-sm font-semibold text-red-700 dark:text-red-300">
          The kitchen just went offline — checkout is paused until we're back.
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-[1.25fr_1fr] gap-10 items-start">
        <div className="space-y-8">
          {/* contact */}
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-stone-400 mb-4">1 · Your details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aline Uwase" autoComplete="name" /></Field>
              <Field label="Phone (WhatsApp ok)"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" autoComplete="tel" /></Field>
              <div className="sm:col-span-2">
                <Field label="Email — for the receipt" hint={user ? "Prefilled from your account" : "Optional"}>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </Field>
              </div>
            </div>
          </section>

          {/* fulfillment */}
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-stone-400 mb-4">2 · Pickup or delivery</h2>
            <Segmented
              value={channel}
              onChange={setChannel}
              options={[
                { value: "pickup", label: <><Flame size={15} /> Pickup<span className="hidden sm:inline"> · ~20 min</span></> },
                { value: "delivery", label: <><Bike size={15} /> Delivery<span className="hidden sm:inline"> · +{money(2000)}</span></> },
              ]}
            />
            {channel === "delivery" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                <Field label="Delivery address">
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <Input className="pl-10" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, house / apartment, district — Kigali" />
                  </div>
                </Field>
              </motion.div>
            )}
            <div className="mt-4">
              <Field label="Notes for the kitchen"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ring the gate, cutlery please, extra sambal…" /></Field>
            </div>
          </section>

          {/* tip */}
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-stone-400 mb-4">3 · Tip the team — 100% goes to staff</h2>
            <div className="flex flex-wrap gap-2.5">
              {[0, 10, 12.5, 15].map((p) => (
                <button
                  key={p}
                  onClick={() => { setTipPct(p); setCustomTip(""); }}
                  className={cn(
                    "px-4 h-11 rounded-lg text-sm font-bold border transition-all",
                    tipPct === p && customTip === "" ? "border-ember-500 bg-ember-500/10 text-ember-600 dark:text-ember-400" : "border-stone-200 dark:border-stone-700 text-stone-500 hover:border-stone-400",
                  )}
                >
                  {p === 0 ? "No tip" : `${p}% · ${money(Math.round((subtotal * p) / 100))}`}
                </button>
              ))}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-stone-400">FRw</span>
                <Input
                  className="w-32 pl-12 h-11"
                  inputMode="numeric"
                  placeholder="Custom"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value.replace(/\D/g, ""))}
                  aria-label="Custom tip amount"
                />
              </div>
            </div>
          </section>

          {/* payment */}
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-stone-400 mb-4">4 · Payment</h2>
            <Segmented
              value={pay}
              onChange={setPay}
              options={[
                { value: "applepay", label: <><Apple size={16} /> Pay</> },
                { value: "googlepay", label: <><Chrome size={15} /> G Pay</> },
                { value: "card", label: <><CreditCard size={15} /> Card</> },
              ]}
            />
            {pay === "card" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 grid sm:grid-cols-[2fr_1fr_1fr] gap-4">
                <Field label="Card number">
                  <Input
                    value={card.num}
                    onChange={(e) => setCard({ ...card, num: e.target.value.replace(/[^\d ]/g, "").slice(0, 19) })}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Expiry"><Input value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })} placeholder="MM/YY" /></Field>
                <Field label="CVC"><Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" inputMode="numeric" /></Field>
              </motion.div>
            )}
            {pay !== "card" && (
              <div className="mt-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                {pay === "applepay" ? <Apple size={20} className="text-ink dark:text-white" /> : <Chrome size={20} className="text-ember-600" />}
                You'll confirm with {pay === "applepay" ? "Face ID / Touch ID" : "your Google account"} when you tap pay. Demo mode — nothing is charged.
              </div>
            )}
          </section>
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-24 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-card p-6">
          <h2 className="font-display text-xl font-bold mb-4">Order summary</h2>
          <ul className="space-y-3">
            {cart.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 text-sm">
                <span className="text-stone-600 dark:text-stone-300">
                  <span className="font-mono font-bold text-ember-600 dark:text-ember-400 mr-2">{l.qty}×</span>
                  {l.name}
                  {l.modifiers.length > 0 && <span className="block text-[12px] text-stone-400 mt-0.5">{l.modifiers.map((m) => m.name).join(" · ")}</span>}
                </span>
                <span className="font-semibold whitespace-nowrap">{money(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t border-dashed border-stone-300 dark:border-stone-700 space-y-2.5 text-sm">
            <div className="flex justify-between text-stone-500"><span>Subtotal</span><span className="font-semibold text-ink dark:text-stone-100">{money(subtotal)}</span></div>
            {promo && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5"><Flame size={13} /> {promo.name} −{promo.percent}%</span>
                <span>−{money(discount)}</span>
              </div>
            )}
            {channel === "delivery" && <div className="flex justify-between text-stone-500"><span>Delivery</span><span className="font-semibold text-ink dark:text-stone-100">{money(deliveryFee)}</span></div>}
            <div className="flex justify-between text-stone-500"><span>Tip (100% to staff)</span><span className="font-semibold text-ink dark:text-stone-100">{money(tip)}</span></div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold"><span>EatLocal platform fee</span><span>{money(0)}</span></div>
            <div className="flex justify-between items-baseline pt-3 border-t border-stone-200 dark:border-stone-800">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-bold">{money(total)}</span>
            </div>
          </div>
          <Button size="lg" className="w-full mt-6" disabled={processing || !accepting} onClick={submit}>
            {processing ? (
              <span className="flex items-center gap-2.5">
                <span className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" /><span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:120ms]" /><span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:240ms]" /></span>
                Processing via Stripe…
              </span>
            ) : (
              <>Pay {money(total)} <ArrowRight size={17} /></>
            )}
          </Button>
          <p className="mt-3.5 text-[11.5px] text-stone-400 text-center leading-relaxed">
            Stripe Connect routes this payment directly to {RESTAURANT.fullName}. EatLocal never holds or skims funds.
          </p>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
