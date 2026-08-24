import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, Flame, MapPin, Plus, Search, SearchX, Star, X } from "lucide-react";
import type { MenuItem } from "../lib/types";
import { RESTAURANT } from "../lib/seed";
import { cn, money, useFakeLoad } from "../lib/utils";
import { useCartCount, useLivePromo, useStore } from "../lib/store";
import { Badge, Button, Modal, Skeleton, Textarea } from "../components/ui";
import { Footer, QtyStepper, TagChip } from "../components/shared";

export default function MenuPage() {
  const categories = useStore((s) => s.categories);
  const accepting = useStore((s) => s.accepting);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const cartCount = useCartCount();
  const promo = useLivePromo();
  const loading = useFakeLoad(700);

  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const setQuery = (v: string) => setParams(v.trim() ? { q: v.trim() } : {}, { replace: true });

  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  const [selected, setSelected] = useState<{ item: MenuItem; catId: string } | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* scrollspy */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveCat(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [categories.length, q]);

  const jump = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const unavailableCount = useMemo(
    () => categories.reduce((n, c) => n + c.items.filter((i) => !i.available).length, 0),
    [categories],
  );

  const results = useMemo(
    () =>
      q
        ? categories.flatMap((c) =>
            c.items
              .filter((i) => (i.name + " " + i.desc).toLowerCase().includes(q))
              .map((item) => ({ item, cat: c.name })),
          )
        : [],
    [categories, q],
  );

  const openItem = (item: MenuItem, catId: string) => item.available && setSelected({ item, catId });

  return (
    <div className="min-h-screen">
      {/* header */}
      <section className="relative overflow-hidden grain border-b border-stone-200/70 dark:border-stone-800">
        <div className="pointer-events-none absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-ember-500/12 blur-[120px]" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  <span className={cn("w-2 h-2 rounded-full", accepting ? "bg-emerald-500 animate-ember-pulse" : "bg-red-500")} />
                  {accepting ? "Kitchen live" : "Kitchen offline"}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-[12px] text-stone-500 flex items-center gap-1"><Clock size={12} /> {RESTAURANT.hours}</span>
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-6xl tracking-tight text-ink dark:text-stone-50">The Live Menu</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-ember-500" /> {RESTAURANT.address}</span>
                <span className="flex items-center gap-1.5"><Star size={14} className="text-ember-500 fill-ember-500" /> {RESTAURANT.rating} · {RESTAURANT.reviews} reviews</span>
                <span className="flex items-center gap-1.5"><Flame size={14} className="text-ember-500" /> cooked over oak & charcoal</span>
              </p>
            </div>
            {cartCount > 0 && (
              <Button onClick={() => setCartOpen(true)} size="md">
                View order · {cartCount} item{cartCount > 1 ? "s" : ""}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {promo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="ember-gradient text-white rounded-xl px-5 py-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold shadow-lift">
                  <Flame size={16} />
                  <span>{promo.name} is live — {promo.percent}% off your whole order, applied automatically at checkout.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!accepting && (
            <div className="mt-6 rounded-xl border border-red-300/60 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-5 py-3.5 flex items-center gap-3 text-sm font-semibold text-red-700 dark:text-red-300">
              <AlertTriangle size={17} /> We're not accepting orders right now — the menu is open for browsing, checkout reopens shortly.
            </div>
          )}
        </div>
      </section>

      {/* sticky search + category nav */}
      <div className="sticky top-[72px] z-40 bg-paper/85 dark:bg-stone-950/85 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 py-3">
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes…"
              aria-label="Search the menu"
              className="w-[150px] sm:w-[220px] h-10 pl-9 pr-8 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-[13px] font-semibold placeholder:text-stone-400 focus:border-ember-500 focus:ring-2 focus:ring-ember-500/20 outline-none transition-all"
            />
            {q && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600">
                <X size={11} />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1" role="tablist" aria-label="Menu categories">
            {categories.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={activeCat === c.id}
                onClick={() => { setQuery(""); setTimeout(() => jump(c.id), 30); }}
                className={cn(
                  "shrink-0 px-4 h-10 rounded-full text-[13.5px] font-bold transition-all duration-200",
                  activeCat === c.id && !q
                    ? "bg-ink text-paper dark:bg-stone-100 dark:text-ink shadow-sm"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-ink dark:hover:text-stone-100 hover:border-ember-400",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* sections / search results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-16">
        {q ? (
          <motion.section key={q} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-3xl font-bold">
                  {results.length} dish{results.length === 1 ? "" : "es"} for “{q}”
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Filtered live against tonight's menu.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                <X size={13} /> Clear search
              </Button>
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 py-16 px-6 text-center">
                <SearchX size={26} className="mx-auto text-stone-400 mb-3" />
                <p className="font-display text-xl font-bold">Nothing on the pass matches that</p>
                <p className="text-sm text-stone-500 mt-2">Try one of the house classics instead:</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  {["rendang", "nasi goreng", "sate", "cendol", "lumpia"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-4 py-2 rounded-full border border-stone-300 dark:border-stone-700 text-[13px] font-bold text-stone-500 hover:border-ember-500 hover:text-ember-600 dark:hover:text-ember-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map(({ item, cat }, i) => (
                  <ItemCard key={item.id} item={item} index={i} onOpen={() => openItem(item, "")} badge={cat} />
                ))}
              </div>
            )}
          </motion.section>
        ) : (
          categories.map((cat) => (
            <section
              key={cat.id}
              id={cat.id}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              className="scroll-mt-36"
            >
              <div className="flex items-baseline justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-3xl font-bold">{cat.name}</h2>
                  {cat.note && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{cat.note}</p>}
                </div>
                <span className="font-mono text-[12px] text-stone-400">{cat.items.length} items</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                        <Skeleton className="h-[168px] rounded-none" />
                        <div className="p-5 space-y-3">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-9 w-full" />
                        </div>
                      </div>
                    ))
                  : cat.items.map((item, i) => (
                      <ItemCard key={item.id} item={item} index={i} onOpen={() => openItem(item, cat.id)} />
                    ))}
              </div>
            </section>
          ))
        )}
        {!q && unavailableCount > 0 && (
          <p className="text-center text-[13px] text-stone-400 -mt-6">
            {unavailableCount} item{unavailableCount > 1 ? "s" : ""} 86'd today — back tomorrow, insha'Allah.
          </p>
        )}
      </main>

      <ItemModal selected={selected} onClose={() => setSelected(null)} />
      <Footer />
    </div>
  );
}

/* ---------------- menu item card ---------------- */

function ItemCard({ item, index, onOpen, badge }: { item: MenuItem; index: number; onOpen: () => void; badge?: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-card overflow-hidden transition-shadow duration-300 hover:shadow-lift",
        !item.available && "opacity-60",
      )}
    >
      <button
        className="w-full text-left disabled:cursor-not-allowed"
        onClick={onOpen}
        disabled={!item.available}
        aria-label={`${item.name}, ${money(item.price)}${item.available ? "" : ", unavailable"}`}
      >
        <div className="relative h-[168px] overflow-hidden">
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", !item.available && "grayscale")}
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {item.tags.map((t) => <TagChip key={t} tag={t} short />)}
          </div>
          {badge && (
            <span className="absolute bottom-3 left-3 bg-ink/85 backdrop-blur-sm text-paper text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              {badge}
            </span>
          )}
          {!item.available && (
            <span className="absolute top-3 right-3 bg-stone-900/90 text-paper text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              86'd today
            </span>
          )}
          {item.available && item.stock < 10 && (
            <span className="absolute bottom-3 right-3 bg-amber-500/95 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Only {item.stock} left
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[18px] font-bold leading-tight">{item.name}</h3>
            <span className="font-mono text-[13px] font-bold text-ember-600 dark:text-ember-400 whitespace-nowrap">{money(item.price)}</span>
          </div>
          <p className="mt-1.5 text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed">{item.desc}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              {item.modifiers.length > 0 ? `${item.modifiers.length} option groups` : "No options"}
            </span>
            {item.available && (
              <span className="w-9 h-9 grid place-items-center rounded-full ember-gradient text-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 shadow-lift">
                <Plus size={16} />
              </span>
            )}
          </div>
        </div>
      </button>
    </motion.article>
  );
}

/* ---------------- Item detail / modifiers modal ---------------- */

function ItemModal({ selected, onClose }: { selected: { item: MenuItem; catId: string } | null; onClose: () => void }) {
  const addToCart = useStore((s) => s.addToCart);
  const toast = useStore((s) => s.toast);
  const [qty, setQty] = useState(1);
  const [single, setSingle] = useState<Record<string, string>>({});
  const [multi, setMulti] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const item = selected?.item;

  useEffect(() => {
    if (item) {
      setQty(1);
      setNotes("");
      const s: Record<string, string> = {};
      item.modifiers.forEach((g) => { if (g.type === "single") s[g.id] = g.options[0]?.id ?? ""; });
      setSingle(s);
      setMulti({});
    }
  }, [item?.id]);

  if (!item) return <Modal open={false} onClose={onClose} label="Item">{null}</Modal>;

  const chosenMods: { name: string; price: number }[] = [];
  item.modifiers.forEach((g) => {
    if (g.type === "single") {
      const opt = g.options.find((o) => o.id === single[g.id]);
      if (opt && opt.price > 0) chosenMods.push({ name: opt.name, price: opt.price });
      else if (opt && g.id === "spice" && opt.id !== "mild") chosenMods.push({ name: opt.name, price: 0 });
    } else {
      (multi[g.id] ?? []).forEach((oid) => {
        const opt = g.options.find((o) => o.id === oid);
        if (opt) chosenMods.push({ name: `+ ${opt.name}`, price: opt.price });
      });
    }
  });

  const unit = item.price + chosenMods.reduce((s, m) => s + m.price, 0);
  const key = `${item.id}|${chosenMods.map((m) => m.name).join(",")}|${notes.trim()}`;

  return (
    <Modal open={!!item} onClose={onClose} label={item.name} wide>
      <div className="grid sm:grid-cols-[240px_1fr]">
        <div className="relative h-44 sm:h-full">
          <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex gap-1.5">{item.tags.map((t) => <TagChip key={t} tag={t} short />)}</div>
        </div>
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">{item.name}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 shrink-0"><X size={17} /></button>
          </div>

          <div className="mt-5 space-y-5 max-h-[38vh] overflow-y-auto slim-scroll pr-1">
            {item.modifiers.map((g) => (
              <fieldset key={g.id}>
                <legend className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                  {g.name} {g.type === "multi" && <span className="text-stone-400 normal-case font-medium">· pick any</span>}
                </legend>
                <div className="space-y-2">
                  {g.options.map((o) => {
                    const isSel = g.type === "single" ? single[g.id] === o.id : (multi[g.id] ?? []).includes(o.id);
                    const toggle = () => {
                      if (g.type === "single") setSingle((s) => ({ ...s, [g.id]: o.id }));
                      else
                        setMulti((m) => {
                          const cur = m[g.id] ?? [];
                          return { ...m, [g.id]: cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur, o.id] };
                        });
                    };
                    return (
                      <button
                        key={o.id}
                        onClick={toggle}
                        aria-pressed={isSel}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all",
                          isSel
                            ? "border-ember-500 bg-ember-500/8 dark:bg-ember-950/40 text-ink dark:text-stone-100"
                            : "border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 text-stone-600 dark:text-stone-300",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className={cn(
                            "grid place-items-center border-2 transition-colors",
                            g.type === "single" ? "w-[18px] h-[18px] rounded-full" : "w-[18px] h-[18px] rounded-md",
                            isSel ? "border-ember-500 bg-ember-500 text-white" : "border-stone-300 dark:border-stone-600",
                          )}>
                            {isSel && (g.type === "single" ? <span className="w-1.5 h-1.5 rounded-full bg-white" /> : <span className="text-[10px] font-bold leading-none">✓</span>)}
                          </span>
                          {o.name}
                        </span>
                        <span className={cn("font-mono text-[12px]", o.price > 0 ? "text-ember-600 dark:text-ember-400 font-bold" : "text-stone-400")}>
                          {o.price > 0 ? `+${money(o.price)}` : "free"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 block" htmlFor="item-notes">Notes for the kitchen</label>
              <Textarea id="item-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="No peanuts, extra lime, sambal on the side…" />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
            <QtyStepper qty={qty} onChange={(d) => setQty((q) => Math.max(1, q + d))} />
            <Button
              size="lg"
              className="flex-1 max-w-[280px]"
              onClick={() => {
                addToCart({ key, itemId: item.id, name: item.name, unitPrice: unit, qty, modifiers: chosenMods, notes: notes.trim() || undefined });
                toast(`${qty}× ${item.name} added`);
                onClose();
              }}
            >
              Add · {money(unit * qty)}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
