import { useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bike, Clock, Flame, LocateFixed, MapPin, Percent, Plus, Search, Star, UtensilsCrossed, Wallet } from "lucide-react";
import { IMG, RESTAURANT } from "../lib/seed";
import { money, cn } from "../lib/utils";
import { useStore } from "../lib/store";
import { Button, Badge } from "../components/ui";
import { OrderTicker, Reveal, Scramble, SectionHead, TagChip, Footer } from "../components/shared";

const REVIEWS = [
  { name: "Keza N.", time: "2 weeks ago", stars: 5, text: "The rendang is dangerously good — ordered direct and it was ready before I parked. Not a single franc wasted on app fees." },
  { name: "Patrick H.", time: "1 month ago", stars: 5, text: "Best sate ayam in Kigali, full stop. The peanut sauce should be studied by scientists." },
  { name: "Aline U.", time: "3 weeks ago", stars: 5, text: "Booked a table for six in about ten seconds. They remembered the birthday note AND the cake candle." },
  { name: "Jean Bosco", time: "2 months ago", stars: 4, text: "Ikan bakar with dabu-dabu on a Friday night is the correct answer to everything. One star withheld until they add a second location." },
  { name: "Diane M.", time: "1 week ago", stars: 5, text: "The live menu is honest — when the lumpia ran out, it said so. Respect. (Restock the lumpia.)" },
  { name: "Samuel T.", time: "3 months ago", stars: 5, text: "Ordered delivery, tracked the ticket live, tip went 100% to the staff. This is how food apps should work." },
];

export default function Home() {
  const navigate = useNavigate();
  const categories = useStore((s) => s.categories);
  const addToCart = useStore((s) => s.addToCart);
  const toast = useStore((s) => s.toast);
  const orders = useStore((s) => s.orders);
  const liveOrder = orders.find((o) => o.status !== "completed") ?? orders[0];

  const popular = useMemo(
    () => categories.flatMap((c) => c.items).filter((i) => i.popular && i.available).slice(0, 6),
    [categories],
  );

  const slots = ["12:00", "12:30", "13:00", "18:00", "18:30", "19:00", "19:30", "20:00"];

  /* ---- "find us near you" — search the menu + geolocation ---- */
  const [query, setQuery] = useState("");
  const [geo, setGeo] = useState<{ km: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = () => {
    if (!("geolocation" in navigator)) return toast("Geolocation isn't supported in this browser.", "error");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ km: kmBetween(pos.coords.latitude, pos.coords.longitude, -1.9351, 30.0821) });
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast("Couldn't read your location — no worries, we're at 18 KG 4 Ave.", "error");
      },
      { timeout: 8000 },
    );
  };

  return (
    <div className="relative">
      <OrderTicker />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden grain">
        <div className="pointer-events-none absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full bg-ember-500/15 blur-[140px]" aria-hidden />
        <div className="pointer-events-none absolute top-1/2 -left-52 w-[420px] h-[420px] rounded-full bg-amber-400/10 blur-[120px]" aria-hidden />
        {/* embers drifting up from the fire */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {[8, 19, 31, 42, 55, 63, 74, 86, 94].map((left, i) => (
            <span
              key={i}
              className="ember-spark"
              style={
                {
                  left: `${left}%`,
                  animationDelay: `${i * 0.65}s`,
                  animationDuration: `${4 + (i % 3) * 1.2}s`,
                  "--drift": `${i % 2 ? 16 : -12}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge tone="ember"><Flame size={11} /> Wood-fire Indonesian kitchen</Badge>
                <Badge tone="neutral"><MapPin size={11} /> Kigali, Rwanda</Badge>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="font-display font-bold text-[44px] sm:text-6xl lg:text-[68px] leading-[1.02] tracking-tight text-ink dark:text-stone-50">
                Rendang worth the
                <span className="relative whitespace-nowrap">
                  <span className="text-ember-gradient italic"> 48 hours.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden>
                    <path d="M3 9c60-6 180-8 294-3" stroke="#f97316" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </span>
                <br />
                <Scramble text="Ordering worth the seconds." delay={500} />
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 text-[16.5px] leading-relaxed text-stone-600 dark:text-stone-300 max-w-xl">
                {RESTAURANT.fullName} now takes orders direct — no apps skimming 30% off your dinner.
                Pay the kitchen, tip the staff, skip the queue.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <Button size="lg" onClick={() => navigate("/menu")}>
                  Order pickup <ArrowRight size={17} />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/reserve")}>
                  <UtensilsCrossed size={17} /> Book a table
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="mt-7 flex flex-wrap items-center gap-2.5 max-w-xl">
                <form
                  className="flex-1 min-w-[250px]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate(query.trim() ? `/menu?q=${encodeURIComponent(query.trim())}` : "/menu");
                  }}
                  role="search"
                >
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search the menu — rendang, sate, cendol…"
                      aria-label="Search the menu"
                      className="w-full h-[52px] pl-11 pr-[92px] rounded-xl border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm text-sm font-semibold placeholder:text-stone-400 focus:border-ember-500 focus:ring-2 focus:ring-ember-500/20 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 px-4 rounded-[10px] ember-gradient text-white text-[13px] font-bold hover:brightness-105 transition-all"
                    >
                      Search
                    </button>
                  </div>
                </form>
                <button
                  onClick={locate}
                  className={cn(
                    "h-[52px] px-4 rounded-xl border flex items-center gap-2 text-[13px] font-bold transition-colors",
                    geo
                      ? "border-emerald-400/60 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                      : "border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-ember-500 hover:text-ember-600 dark:hover:text-ember-400",
                  )}
                >
                  <LocateFixed size={15} className={locating ? "animate-spin" : ""} />
                  {locating
                    ? "Locating…"
                    : geo
                      ? `${geo.km < 1 ? Math.round(geo.km * 1000) + " m" : geo.km.toFixed(1) + " km"} away`
                      : "Near me"}
                </button>
              </div>
              {geo && (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5 text-[12.5px] font-semibold text-stone-500 dark:text-stone-400">
                  {geo.km <= 8 ? (
                    <>You're <span className="text-emerald-600 dark:text-emerald-400">inside our delivery radius</span> — order straight to your door.</>
                  ) : (
                    <>You're a little far for our riders — but <span className="text-ember-600 dark:text-ember-400">pickup is always open</span>.</>
                  )}
                </motion.p>
              )}
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] font-semibold text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-2"><Percent size={14} className="text-ember-500" /> 0% commission, forever</span>
                <span className="flex items-center gap-2"><Wallet size={14} className="text-ember-500" /> FRw 0 platform fees</span>
                <span className="flex items-center gap-2"><Star size={14} className="text-ember-500 fill-ember-500" /> {RESTAURANT.rating} · {RESTAURANT.reviews} reviews</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="relative">
            <div className="relative">
              <div className="absolute -inset-4 ember-gradient rounded-[28px] rotate-2 opacity-20 blur-sm" aria-hidden />
              <div className="relative rounded-[24px] overflow-hidden shadow-lift">
                <img
                  src={IMG.hero}
                  alt="Indonesian feast — rendang, satay and nasi goreng on a teak table"
                  className="kenburns w-full aspect-[4/3] object-cover"
                  loading="eager"
                />
              </div>
              {/* floating live ticket */}
              {liveOrder && (
                <motion.div
                  className="absolute -bottom-6 -left-3 sm:-left-8 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md rounded-xl border border-white/50 dark:border-stone-700/60 shadow-lift p-4 w-[240px] animate-float"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 22 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] font-bold text-ember-600 dark:text-ember-400">{liveOrder.code}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ember-pulse" /> in kitchen
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-snug">
                    {liveOrder.items[0]?.name} ×{liveOrder.items[0]?.qty}
                    {liveOrder.items.length > 1 && <span className="text-stone-400"> +{liveOrder.items.length - 1} more</span>}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[12px]">
                    <span className="text-stone-500 flex items-center gap-1"><Clock size={11} /> {Math.max(1, Math.round((liveOrder.eta - Date.now()) / 60000))} min</span>
                    <span className="font-bold">{money(liveOrder.total)}</span>
                  </div>
                </motion.div>
              )}
              {/* rating chip */}
              <div className="absolute -top-4 right-5 bg-ink dark:bg-stone-100 text-paper dark:text-ink rounded-full pl-3 pr-4 py-2 flex items-center gap-2 shadow-lift">
                <Star size={15} className="text-ember-400 dark:text-ember-600 fill-ember-400 dark:fill-ember-600" />
                <span className="text-[13px] font-bold">{RESTAURANT.rating} on Google</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= POPULAR TONIGHT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <SectionHead
          kicker="Straight from the wok"
          title="Most ordered this week"
          right={
            <Link to="/menu" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-ember-600 dark:text-ember-400 hover:gap-2.5 transition-all">
              Full live menu <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {popular.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06} className="snap-start shrink-0 w-[260px] sm:w-[290px]">
              <motion.article
                whileHover={{ y: -4 }}
                className="group rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-card overflow-hidden transition-shadow duration-300 hover:shadow-lift"
              >
                <div className="relative h-[170px] overflow-hidden">
                  <img src={item.img} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {item.tags.slice(0, 2).map((t) => <TagChip key={t} tag={t} short />)}
                  </div>
                </div>
                <div className="p-4.5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-[18px] font-bold leading-tight">{item.name}</h3>
                    <span className="font-mono text-[13px] font-bold text-ember-600 dark:text-ember-400 whitespace-nowrap">{money(item.price)}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">{item.desc}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate("/menu")}>Customize</Button>
                    <Button
                      size="sm"
                      aria-label={`Quick add ${item.name}`}
                      onClick={() => {
                        addToCart({ key: item.id, itemId: item.id, name: item.name, unitPrice: item.price, qty: 1, modifiers: [] });
                        toast(`${item.name} added to your order`);
                      }}
                    >
                      <Plus size={15} />
                    </Button>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= HOW DIRECT ORDERING WORKS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 items-start">
          <div>
            <SectionHead kicker="Why order direct" title="The 30% toll booth is gone" />
            <div className="space-y-9">
              {[
                { n: "01", t: "Order from the live menu", d: "Real-time stock, honest photos, your sambal level remembered. Guest checkout — no account needed." },
                { n: "02", t: "The kitchen fires instantly", d: "Your ticket lands on the pass in under a second. Watch it move: received → preparing → ready." },
                { n: "03", t: "Pick up, or get it delivered", d: "Every franc of your bill goes to the restaurant. Tips go 100% to the staff who made your food." },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 0.1} className="flex gap-6">
                  <span className="font-display italic text-[40px] leading-none font-bold text-ember-gradient shrink-0 w-14">{s.n}</span>
                  <div>
                    <h3 className="text-[17px] font-bold">{s.t}</h3>
                    <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-card">
              <div className="bg-stone-200/60 dark:bg-stone-900 p-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 mb-1.5">Typical delivery app</p>
                  <p className="font-display text-3xl font-bold text-stone-500 dark:text-stone-500 line-through decoration-red-500/70 decoration-4">30% + fees</p>
                </div>
                <div className="text-right text-[12px] text-stone-400 font-medium max-w-[130px]">of every order leaves the restaurant</div>
              </div>
              <div className="ember-gradient text-white p-6 flex items-end justify-between gap-4 relative overflow-hidden">
                <span className="absolute -right-8 -top-10 opacity-15" aria-hidden><Flame size={170} /></span>
                <div className="relative">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 mb-1.5">EatLocal OS</p>
                  <p className="font-display text-3xl font-bold">0% — flat $99/mo</p>
                </div>
                <div className="relative text-right text-[12px] text-white/80 font-medium max-w-[130px]">the kitchen keeps everything else</div>
              </div>
              <div className="p-6 grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-950 text-center">
                {[
                  { v: money(0), l: "platform fee per order" },
                  { v: "100%", l: "of tips reach staff" },
                  { v: "<1s", l: "ticket hits the kitchen" },
                ].map((x) => (
                  <div key={x.l} className="px-2">
                    <p className="font-mono text-lg font-bold text-ink dark:text-stone-100">{x.v}</p>
                    <p className="mt-1 text-[11px] text-stone-400 leading-snug">{x.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= WHAT KIGALI SAYS ================= */}
      <section className="mt-20 sm:mt-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead
            kicker={`${RESTAURANT.rating} ★ on Google · ${RESTAURANT.reviews} reviews`}
            title="What Kigali says after the first bite"
          />
        </div>
        <div className="relative" role="region" aria-label="Customer reviews">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-paper dark:from-stone-950 to-transparent z-10" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper dark:from-stone-950 to-transparent z-10" aria-hidden />
          <div className="flex gap-5 w-max animate-marquee hover:[animation-play-state:paused] py-2" style={{ animationDuration: "55s" }}>
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <figure key={i} className="w-[320px] shrink-0 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-card p-5 transition-shadow duration-300 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <Stars n={r.stars} />
                  <span className="text-[11px] font-semibold text-stone-400">{r.time}</span>
                </div>
                <blockquote className="mt-3 text-[14px] leading-relaxed text-stone-600 dark:text-stone-300">“{r.text}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full ember-gradient text-white grid place-items-center text-[12px] font-bold">{r.name[0]}</span>
                  <div className="leading-tight">
                    <p className="text-[13px] font-bold">{r.name}</p>
                    <p className="text-[11px] text-stone-400">Google review · verified order</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ================= RESERVE TEASER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28">
        <Reveal>
          <div className="relative rounded-[24px] overflow-hidden grain bg-ink text-paper">
            <img src={IMG.interior} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" aria-hidden />
            <div className="relative p-8 sm:p-14 max-w-2xl">
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-ember-400 mb-3">Reservations · real-time availability</p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold leading-[1.08]">
                A table by the fire, <span className="italic text-ember-300">held for you.</span>
              </h2>
              <p className="mt-4 text-stone-300 leading-relaxed max-w-lg">
                Parties of 1–8, booked in seconds. Confirmation lands by email instantly — no phone tag, no double-booking.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {slots.map((s, i) => (
                  <motion.button
                    key={s}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/reserve")}
                    className={cn(
                      "px-4 py-2 rounded-full text-[13px] font-bold border transition-colors",
                      i === 2 ? "ember-gradient text-white border-transparent" : "border-white/25 text-stone-200 hover:border-ember-400 hover:text-ember-300",
                    )}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-6 text-[13px] text-stone-400">
                <span className="flex items-center gap-2"><Clock size={14} className="text-ember-400" /> {RESTAURANT.hours}</span>
                <span className="flex items-center gap-2"><Bike size={14} className="text-ember-400" /> Delivery across Kigali</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= PARTNER CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28">
        <Reveal>
          <div className="rounded-[24px] border-2 border-dashed border-ember-500/40 bg-ember-500/5 dark:bg-ember-950/20 p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-ember-600 dark:text-ember-400 mb-2">EatLocal OS · for restaurant owners</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight max-w-xl">
                Run your restaurant on the system that takes <span className="text-ember-gradient">nothing per order.</span>
              </h2>
            </div>
            <PartnerButton />
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

function PartnerButton() {
  const openAuth = useStore((s) => s.openAuth);
  return (
    <Button size="lg" className="shrink-0" onClick={() => openAuth("partner")}>
      See the dashboard <ArrowRight size={17} />
    </Button>
  );
}

/** Haversine distance in km — used to tell diners if they're inside the delivery radius. */
function kmBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? "text-ember-500 fill-ember-500" : "text-stone-300 dark:text-stone-700"} />
      ))}
    </span>
  );
}
