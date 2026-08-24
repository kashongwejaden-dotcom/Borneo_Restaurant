import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Boxes, CalendarDays, ChevronLeft, Flame, LayoutDashboard, LogOut, Receipt, Store, Ticket, UtensilsCrossed, Wifi,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useLowStock, useNewOrderCount, useStore } from "../lib/store";
import { Button } from "../components/ui";
import { BrandMark } from "../components/shared";
import { RESTAURANT } from "../lib/seed";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/orders", label: "Orders", icon: Receipt },
  { to: "/dashboard/menu", label: "Menu Builder", icon: UtensilsCrossed },
  { to: "/dashboard/reservations", label: "Reservations", icon: CalendarDays },
  { to: "/dashboard/promos", label: "Promotions", icon: Ticket },
  { to: "/dashboard/inventory", label: "Inventory", icon: Boxes },
];

export default function DashboardLayout() {
  const user = useStore((s) => s.user);
  const loginAdmin = useStore((s) => s.loginAdmin);
  const logout = useStore((s) => s.logout);
  const accepting = useStore((s) => s.accepting);
  const toggleAccepting = useStore((s) => s.toggleAccepting);
  const toast = useStore((s) => s.toast);
  const newCount = useNewOrderCount();
  const lowStock = useLowStock();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-stone-950 grain relative grid place-items-center px-4">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-ember-500/12 blur-[130px]" aria-hidden />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-lg">
          <BrandMark className="w-14 h-14 mx-auto" />
          <h1 className="font-display text-4xl font-bold text-white mt-6">Staff entrance</h1>
          <p className="mt-3 text-stone-400 leading-relaxed">
            The dashboard is private to restaurant owners and staff. In production this is guarded by NextAuth with the <span className="font-mono text-[13px] text-ember-400">ADMIN</span> role.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => { loginAdmin("Borneo Owner", "owner@borneo.rw"); toast("Signed in as restaurant owner"); }}>
              <Flame size={16} /> Enter demo owner account
            </Button>
            <Button size="lg" variant="line" onClick={() => navigate("/")}>
              <ChevronLeft size={16} /> Back to storefront
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const pageTitle = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to) && n.to !== "/dashboard"))?.label ?? "Overview";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex">
      {/* ---------- sidebar ---------- */}
      <aside className="hidden lg:flex flex-col w-[248px] shrink-0 border-r border-stone-800/80 bg-stone-900/40 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-5 h-[72px] border-b border-stone-800/80">
          <BrandMark className="w-9 h-9" />
          <div className="leading-none">
            <p className="font-display font-bold text-white text-[16px]">{RESTAURANT.name} · OS</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mt-1">Restaurant dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Dashboard">
          {NAV.map((n) => {
            const I = n.icon;
            const badge = n.label === "Orders" ? newCount : n.label === "Inventory" ? lowStock.length : 0;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 h-11 rounded-lg text-[13.5px] font-semibold transition-all relative",
                    isActive ? "bg-ember-500/12 text-ember-400" : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/60",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="nav-pill" className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full ember-gradient" />}
                    <I size={17} />
                    {n.label}
                    {badge > 0 && (
                      <span className="ml-auto min-w-[20px] h-5 px-1.5 grid place-items-center rounded-full bg-ember-500 text-white text-[10.5px] font-bold font-mono">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-ember-500">EatLocal OS</p>
            <p className="text-[12.5px] text-stone-400 mt-1.5 leading-relaxed">Flat $99/mo · <span className="text-stone-200 font-semibold">0% per order</span>, forever.</p>
          </div>
          <button onClick={() => navigate("/")} className="mt-3 flex items-center gap-2 text-[12.5px] font-semibold text-stone-500 hover:text-stone-200 transition-colors px-1">
            <Store size={14} /> View public storefront
          </button>
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-7 h-[72px]">
            <div className="flex items-center gap-3 min-w-0">
              <BrandMark className="w-8 h-8 lg:hidden shrink-0" />
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white truncate">{pageTitle}</h1>
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1.5">
                <Wifi size={11} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ember-pulse" />
                Live · SSE
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Accepting orders toggle — the most important switch in the house */}
              <button
                onClick={() => { toggleAccepting(); toast(accepting ? "Kitchen is now OFFLINE — storefront checkout paused" : "Kitchen is back ONLINE — accepting orders", accepting ? "error" : "success"); }}
                aria-pressed={accepting}
                className={cn(
                  "flex items-center gap-2.5 h-11 pl-3.5 pr-4 rounded-xl border text-[13px] font-bold transition-all",
                  accepting ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-400",
                )}
              >
                <span className={cn("relative w-2.5 h-2.5 rounded-full", accepting ? "bg-emerald-400" : "bg-red-400")}>
                  <span className={cn("absolute inset-0 rounded-full animate-ping", accepting ? "bg-emerald-400" : "bg-red-400")} style={{ animationDuration: "1.8s" }} aria-hidden />
                </span>
                <span className="hidden sm:inline">{accepting ? "Accepting orders" : "Kitchen offline"}</span>
                <span className={cn(
                  "relative inline-flex items-center w-10 h-6 rounded-full transition-colors",
                  accepting ? "bg-emerald-500" : "bg-stone-700",
                )}>
                  <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 30 }} className="absolute w-4.5 h-4.5 w-[18px] h-[18px] rounded-full bg-white shadow" style={{ left: accepting ? 21 : 3 }} />
                </span>
              </button>

              <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-stone-800">
                <span className="w-9 h-9 rounded-full ember-gradient text-white grid place-items-center text-[13px] font-bold shrink-0">
                  {user.name[0]}
                </span>
                <div className="hidden md:block leading-tight">
                  <p className="text-[13px] font-bold text-white">{user.name}</p>
                  <p className="text-[11px] text-stone-500">{user.email}</p>
                </div>
                <button onClick={() => { logout(); navigate("/"); toast("Signed out"); }} aria-label="Sign out" className="w-9 h-9 grid place-items-center rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800/70 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* mobile nav */}
          <nav className="lg:hidden flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar" aria-label="Dashboard mobile">
            {NAV.map((n) => {
              const I = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cn("flex items-center gap-2 shrink-0 px-3.5 h-9 rounded-full text-[12.5px] font-bold", isActive ? "ember-gradient text-white" : "bg-stone-900 text-stone-400 border border-stone-800")
                  }
                >
                  <I size={14} /> {n.label}
                </NavLink>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 px-4 sm:px-7 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
