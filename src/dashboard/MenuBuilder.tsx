import { useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { AlertTriangle, GripVertical, Star } from "lucide-react";
import type { Category, MenuItem } from "../lib/types";
import { cn, money, useFakeLoad } from "../lib/utils";
import { useStore } from "../lib/store";
import { Skeleton, Switch } from "../components/ui";
import { TagChip } from "../components/shared";

export default function MenuBuilder() {
  const categories = useStore((s) => s.categories);
  const reorderItems = useStore((s) => s.reorderItems);
  const toast = useStore((s) => s.toast);
  const loading = useFakeLoad(600);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
      <p className="text-[13px] text-stone-400 -mt-1">
        Drag to reorder how dishes appear on the live menu · flip <span className="text-stone-200 font-semibold">Available</span> to 86 an item instantly · tap a price to edit it in place.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {categories.map((cat) => (
          <CategorySection key={cat.id} cat={cat} loading={loading} />
        ))}
      </DndContext>
    </div>
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
      </div>
    </motion.div>
  );
}

function PriceEditor({ item, catId }: { item: MenuItem; catId: string }) {
  const updateItem = useStore((s) => s.updateItem);
  const toast = useStore((s) => s.toast);
  const [draft, setDraft] = useState(String(item.price));

  const commit = () => {
    const val = Math.max(0, Number(draft) || 0);
    if (val !== item.price) {
      updateItem(catId, item.id, { price: val });
      toast(`${item.name} price → ${money(val)}`);
    } else {
      setDraft(String(item.price));
    }
  };

  return (
    <div className="relative w-[118px] shrink-0">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-stone-500">FRw</span>
      <input
        value={Number(draft).toLocaleString()}
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
