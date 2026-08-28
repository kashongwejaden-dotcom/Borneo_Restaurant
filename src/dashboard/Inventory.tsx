import { motion } from "framer-motion";
import { AlertTriangle, Boxes, PackagePlus, Power } from "lucide-react";
import { cn, money, useFakeLoad } from "../lib/utils";
import { useLowStock, useStore } from "../lib/store";
import { Button, Skeleton } from "../components/ui";

export default function Inventory() {
  const loading = useFakeLoad(550);
  const categories = useStore((s) => s.categories);
  const updateItem = useStore((s) => s.updateItem);
  const toast = useStore((s) => s.toast);
  const low = useLowStock();

  const all = categories.flatMap((c) => c.items.map((i) => ({ item: i, category: c.name, catId: c.id })));

  return (
    <div className="space-y-8 max-w-5xl">
      {/* low stock alerts */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center"><AlertTriangle size={18} /></span>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Low-stock alerts</h2>
            <p className="text-[12.5px] text-stone-500">Items under 10 units — restock or 86 them before the dinner rush.</p>
          </div>
          <span className="ml-auto font-mono text-[13px] font-bold text-amber-400 bg-amber-500/10 rounded-full px-3.5 py-1.5">{low.length} alerts</span>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3.5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)}</div>
        ) : low.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
            <Boxes size={22} className="mx-auto text-emerald-400 mb-2.5" />
            <p className="font-bold text-emerald-300">All stocked up</p>
            <p className="text-[12.5px] text-stone-500 mt-1">Nothing is under 10 units. Chef's kiss.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3.5">
            {low.map(({ item, category, }, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn("rounded-2xl border p-4.5 p-5 flex items-center gap-4", item.stock < 5 ? "border-red-500/50 bg-red-500/5" : "border-amber-500/40 bg-amber-500/5")}
              >
                <img src={item.img} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[14.5px] text-white truncate">{item.name}</p>
                  <p className="text-[12px] text-stone-500">{category} · {money(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2.5">
                    <div className="flex-1 h-2 rounded-full bg-stone-800 overflow-hidden max-w-[120px]">
                      <div className={cn("h-full rounded-full", item.stock < 5 ? "bg-red-500" : "bg-amber-500")} style={{ width: `${Math.min(100, (item.stock / 10) * 100)}%` }} />
                    </div>
                    <span className={cn("font-mono text-[12px] font-bold", item.stock < 5 ? "text-red-400" : "text-amber-400")}>{item.stock} units</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" onClick={() => { updateItem(findCatId(categories, item.id) ?? "", item.id, { stock: item.stock + 50 }); toast(`${item.name} restocked · now ${item.stock + 50} units`); }}>
                    <PackagePlus size={13} /> +50
                  </Button>
                  <Button size="sm" variant="line" onClick={() => { updateItem(findCatId(categories, item.id) ?? "", item.id, { available: false }); toast(`${item.name} 86'd until restocked`, "info"); }}>
                    <Power size={13} /> 86 it
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* full inventory */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-stone-800 text-stone-300 grid place-items-center"><Boxes size={18} /></span>
          <div>
            <h2 className="font-display text-xl font-bold text-white">All items</h2>
            <p className="text-[12.5px] text-stone-500">Live stock levels across the whole menu.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-800 bg-stone-900/50 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <ul className="divide-y divide-stone-800/80">
              {all.map(({ item, category, catId }) => {
                const pct = Math.min(100, (item.stock / 40) * 100);
                const lvl = item.stock < 5 ? "text-red-400" : item.stock < 10 ? "text-amber-400" : "text-emerald-400";
                return (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-stone-900/70 transition-colors">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.stock < 5 ? "#ef4444" : item.stock < 10 ? "#f59e0b" : "#10b981" }} />
                    <p className="font-semibold text-[13.5px] text-stone-200 flex-1 truncate">{item.name}</p>
                    <span className="hidden sm:block text-[12px] text-stone-500 w-28 truncate">{category}</span>
                    <div className="w-24 sm:w-36 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div className={cn("h-full rounded-full", item.stock < 5 ? "bg-red-500" : item.stock < 10 ? "bg-amber-500" : "bg-emerald-500/80")} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={cn("font-mono text-[12.5px] font-bold w-16 text-right", lvl)}>{item.stock} u</span>
                    <button
                      onClick={() => { updateItem(catId, item.id, { stock: item.stock + 50 }); toast(`${item.name} +50 units`); }}
                      className="text-[11.5px] font-bold text-ember-400 hover:text-ember-300 uppercase tracking-wide w-16 text-right shrink-0"
                    >
                      +50
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function findCatId(categories: { id: string; items: { id: string }[] }[], itemId: string) {
  return categories.find((c) => c.items.some((i) => i.id === itemId))?.id;
}
