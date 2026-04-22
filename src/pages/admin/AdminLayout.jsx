// src/pages/admin/AdminLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { logout, getCurrentUser } from "../../services/AuthService";
import AppShell from "../../components/ui/AppShell";
import BackgroundFX from "../../components/ui/BackgroundFX";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminLayout() {
  const user = getCurrentUser();
  const location = useLocation();
  const navItems = [
  { to: "/admin", label: "Solicitudes", end: true },
  { to: "/admin/novedades", label: "Novedades" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/capacitaciones", label: "Capacitaciones" },
  { to: "/admin/capacitaciones-categorias", label: "Cat. Capacitaciones" },
  { to: "/admin/servicios-tecnicos", label: "ST" },
  { to: "/admin/productos", label: "Productos" },
];

  return (
    <AppShell user={user} navItems={navItems}>
      <BackgroundFX />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </AppShell>
  );
}
