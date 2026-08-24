import { useEffect } from "react";
import { HashRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useLiveFeed, useStore } from "./lib/store";
import { Navbar, CartDrawer, AuthModal } from "./components/shared";
import { ToastHost } from "./components/ui";
import Home from "./pages/Home";
import MenuPage from "./pages/Menu";
import Checkout from "./pages/Checkout";
import Tracking from "./pages/Tracking";
import Reserve from "./pages/Reserve";
import DashboardLayout from "./dashboard/DashboardLayout";
import Overview from "./dashboard/Overview";
import OrdersBoard from "./dashboard/Orders";
import MenuBuilder from "./dashboard/MenuBuilder";
import ReservationsPage from "./dashboard/Reservations";
import Promotions from "./dashboard/Promotions";
import Inventory from "./dashboard/Inventory";

/** Reset scroll on route change (hash router). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** Storefront chrome shared by all customer pages. */
function CustomerShell() {
  return (
    <>
      <Navbar />
      <Outlet />
      <CartDrawer />
      <AuthModal />
    </>
  );
}

export default function App() {
  const theme = useStore((s) => s.theme);

  // keep <html> class in sync with persisted theme on first load
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // simulated SSE connection: live orders stream in & kitchen tickets advance
  useLiveFeed();

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Restaurant admin — private, ADMIN role only */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="orders" element={<OrdersBoard />} />
          <Route path="menu" element={<MenuBuilder />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="promos" element={<Promotions />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        {/* Customer-facing storefront */}
        <Route element={<CustomerShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<Tracking />} />
          <Route path="/track/:code" element={<Tracking />} />
          <Route path="/reserve" element={<Reserve />} />
        </Route>
      </Routes>
      <ToastHost />
    </HashRouter>
  );
}
