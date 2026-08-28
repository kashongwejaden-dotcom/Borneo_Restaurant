import { useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { AlertTriangle, GripVertical, Plus, Star, Trash2 } from "lucide-react";
import type { Category, DietaryTag, MenuItem } from "../lib/types";
import { cn, money, uid, useFakeLoad } from "../lib/utils";
import { useStore } from "../lib/store";
import { Button, Field, Input, Modal, Select, Skeleton, Switch, Textarea } from "../components/ui";
import { TagChip } from "../components/shared";
import { IMG } from "../lib/seed";

export default function MenuBuilder() {
  const categories = useStore((s) => s.categories);
  const reorderItems = useStore((s) => s.reorderItems);
  const toast = useStore((s) => s.toast);
  const loading = useFakeLoad(600);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [creating, setCreating] = useState(false);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const cat = categories.find((c) => c.items.some((i) => i.id === active.id));
    if (!cat) return;
    const from = cat.items.findIndex((i) => i.id === active.id);
    const to = cat.items.findIndex((i) => i.id === over.id);
    reorderItems(cat.id, from, to);
    toast(`Menu reordered — ${cat.name}`, "info");
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 -mt-1">
        <p className="text-[13px] text-stone-400 max-w-xl">
          Drag to reorder how dishes appear on the live menu · flip <span className="text-stone-200 font-semibold">Available</span> to 86 an item instantly · tap a price to edit it in place.
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> Post a new dish
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {categories.map((cat) => (
          <CategorySection key={cat.id} cat={cat} loading={loading} />
        ))}
      </DndContext>

      <NewDishModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

/* ---------------- publish a new dish ---------------- */

const ALL_TAGS: DietaryTag[] = ["V", "VG", "GF", "SPICY"];
const IMAGE_CHOICES: { key: string; url: string; label: string }[] = [
  { key: "rendang", url: IMG.rendang, label: "Rendang-style main" },
  { key: "nasigoreng", url: IMG.nasigoreng, label: "Rice / wok" },
  { key: "sate", url: IMG.sate, label: "Grill / satay" },
  { key: "ikan", url: IMG.ikan, label: "Fish" },
  { key: "lumpia", url: IMG.lumpia, label: "Small plates" },
  { key: "cendol", url: IMG.cendol, label: "Dessert / drinks" },
  { key: "chef", url: IMG.chef, label: "From the fire" },
  { key: "sambal", url: IMG.sambal, label: "Sambal / condiments" },
];

function NewDishModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const categories = useStore((s) => s.categories);
  const addItem = useStore((s) => s.addItem);
  const toast = useStore((s) => s.toast);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("20");
  const [catId, setCatId] = useState("");
  const [img, setImg] = useState(IMAGE_CHOICES[0].url);
  const [tags, setTags] = useState<DietaryTag[]>([]);
  const [err, setErr] = useState("");

  const effectiveCat = catId || categories[0]?.id;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Math.round(Number(price));
    if (!name.trim()) return setErr("The dish needs a name.");
    if (!p || p <= 0) return setErr("Set a price in RWF — whole numbers only.");
    if (!effectiveCat) return setErr("Pick a category.");
    addItem(effectiveCat, {
      id: uid("dish"),
      name: name.trim(),
      desc: desc.trim() || "A new dish from our kitchen.",
      price: p,
      img,
      tags,
      available: true,
      stock: Math.max(0, Math.round(Number(stock) || 0)),
      modifiers: [],
    });
    toast(`“${name.trim()}” is live on the menu`);
    setName(""); setDesc(""); setPrice(""); setStock("20"); setTags([]); setErr("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} label="Post a new dish" wide>
      <form onSubmit={submit} className="p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ember-500 mb-1.5">Menu builder</p>
        <h2 className="font-display text-2xl font-bold text-ink dark:text-white">Post a new dish</h2>
        <p className="text-sm text-stone-500 mt-1.5">It appears on the live menu the moment you publish — no restarts, no waiting.</p>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Field label="Dish name"><Input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="e.g. Bebek Goreng" /></Field>
          <Field label="Category">
            <Select value={effectiveCat} onChange={(e) => setCatId(e.target.value)} className="[color-scheme:dark]">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description"><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's in it, how it's cooked — one hungry sentence." /></Field>
          </div>
          <Field label="Price (FRw)"><Input inputMode="numeric" value={price} onChange={(e) => { setPrice(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="9500" /></Field>
          <Field label="Starting stock (units)"><Input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} /></Field>
        </div>

        <p className="mt-5 mb-2 text-[12px] font-bold uppercase tracking-wider text-stone-400">Photo</p>
        <div className="grid grid-cols-4 gap-2.5">
          {IMAGE_CHOICES.map((c) => (
            <button
              type="button"
              key={c.key}
              onClick={() => setImg(c.url)}
              aria-pressed={img === c.url}
              className={cn(
                "relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all",
                img === c.url ? "border-ember-500 shadow-lift scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={c.url} alt={c.label} className="w-full h-full object-cover" loading="lazy" />
              {img === c.url && <span className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full ember-gradient text-white grid place-items-center text-[10px] font-bold">✓</span>}
            </button>
          ))}
        </div>

        <p className="mt-5 mb-2 text-[12px] font-bold uppercase tracking-wider text-stone-400">Dietary tags</p>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => setTags((cur) => (on ? cur.filter((x) => x !== t) : [...cur, t]))}
                aria-pressed={on}
                className={cn(
                  "px-3.5 h-9 rounded-full text-[12px] font-bold border transition-colors",
                  on ? "ember-gradient text-white border-transparent" : "border-stone-300 dark:border-stone-700 text-stone-500 hover:border-ember-400",
                )}
              >
                {t === "V" ? "Vegetarian" : t === "VG" ? "Vegan" : t === "GF" ? "Gluten-free" : "Spicy"}
              </button>
            );
          })}
        </div>

        {err && <p className="mt-4 text-[12.5px] font-semibold text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5">{err}</p>}

        <div className="mt-7 flex justify-end gap-3">
          <Button type="button" variant="line" onClick={onClose}>Cancel</Button>
          <Button type="submit"><Plus size={15} /> Publish to live menu</Button>
        </div>
      </form>
    </Modal>
  );
}

function CategorySection({ cat, loading }: { cat: Category; loading: boolean }) {
  const availableCount = cat.items.filter((i) => i.available).length;
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-[22px] font-bold text-white">{cat.name}</h2>
          {cat.note && <span className="text-[12.5px] text-stone-500">{cat.note}</span>}
        </div>
        <span className="text-[12px] font-mono text-stone-500">{availableCount}/{cat.items.length} live</span>
      </div>

      <SortableContext items={cat.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="rounded-2xl border border-stone-800 bg-stone-900/50 divide-y divide-stone-800/80 overflow-hidden">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12" /></div>)
            : cat.items.map((item) => <ItemRow key={item.id} item={item} catId={cat.id} />)}
        </div>
      </SortableContext>
    </section>
  );
}

function ItemRow({ item, catId }: { item: MenuItem; catId: string }) {
  const updateItem = useStore((s) => s.updateItem);
  const removeItem = useStore((s) => s.removeItem);
  const toast = useStore((s) => s.toast);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const low = item.stock < 10;

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3.5 sm:gap-5 px-3.5 sm:px-5 py-3.5 bg-stone-900/60", isDragging && "opacity-60 z-10 relative", !item.available && "opacity-55")}
    >
      <button {...attributes} {...listeners} aria-label={`Reorder ${item.name}`} className="cursor-grab active:cursor-grabbing text-stone-600 hover:text-stone-300 touch-none shrink-0">
        <GripVertical size={17} />
      </button>

      <img src={item.img} alt="" className={cn("w-12 h-12 rounded-lg object-cover shrink-0", !item.available && "grayscale")} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[14.5px] text-white truncate">{item.name}</p>
          {item.popular && <Star size={12} className="text-ember-400 fill-ember-400 shrink-0" />}
          <span className="hidden md:flex gap-1">{item.tags.map((t) => <TagChip key={t} tag={t} short />)}</span>
        </div>
        <p className="text-[12px] text-stone-500 mt-0.5 flex items-center gap-2 flex-wrap">
          {item.modifiers.length > 0 ? `${item.modifiers.length} option groups` : "no options"}
          {low && (
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <AlertTriangle size={11} /> {item.stock} left in stock
            </span>
          )}
        </p>
      </div>

      <PriceEditor item={item} catId={catId} />

      <div className="hidden sm:flex flex-col items-end gap-1 w-[74px] shrink-0">
        <span className={cn("font-mono text-[12px] font-bold", low ? "text-amber-400" : "text-stone-400")}>{item.stock} units</span>
        <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
          <div className={cn("h-full rounded-full", low ? "bg-amber-500" : "bg-emerald-500/70")} style={{ width: `${Math.min(100, (item.stock / 40) * 100)}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <span className={cn("text-[10.5px] font-bold uppercase tracking-wider w-8 text-right", item.available ? "text-emerald-400" : "text-stone-500")}>
          {item.available ? "Live" : "86'd"}
        </span>
        <Switch
          checked={item.available}
          onChange={() => {
            updateItem(catId, item.id, { available: !item.available });
            toast(`${item.name} is now ${item.available ? "86'd — hidden from the menu" : "back on the live menu"}`, item.available ? "info" : "success");
          }}
          label={`Toggle availability for ${item.name}`}
        />
        <button
          onClick={() => {
            removeItem(catId, item.id);
            toast(`${item.name} removed from the menu`, "info");
          }}
          aria-label={`Remove ${item.name} from the menu`}
          title="Remove from menu"
          className="w-9 h-9 grid place-items-center rounded-lg border border-stone-800 text-stone-600 hover:border-red-500/60 hover:text-red-400 transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function PriceEditor({ item, catId }: { item: MenuItem; catId: string }) {
  const updateItem = useStore((s) => s.updateItem);
  const toast = useStore((s) => s.toast);
  const [draft, setDraft] = useState(String(item.price));

  const commit = () => {
    // empty field = revert to the current price, never silently zero it out
    if (draft.trim() === "") return setDraft(String(item.price));
    const val = Math.max(0, Number(draft) || 0);
    if (val !== item.price) {
      updateItem(catId, item.id, { price: val });
      toast(`${item.name} price → ${money(val)}`);
    }
    setDraft(String(val));
  };

  return (
    <div className="relative w-[118px] shrink-0">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-stone-500">FRw</span>
      <input
        value={draft === "" ? "" : Number(draft).toLocaleString()}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        inputMode="numeric"
        aria-label={`Price for ${item.name}`}
        className="w-full h-10 rounded-lg bg-stone-950/80 border border-stone-700/80 pl-10 pr-2 text-right font-mono text-[13px] font-bold text-white focus:border-ember-500 focus:ring-2 focus:ring-ember-500/25 outline-none transition-shadow"
      />
    </div>
  );
}
