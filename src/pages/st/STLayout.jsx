// src/pages/st/STLayout.jsx
import { Outlet } from "react-router-dom";
import { getCurrentUser } from "../../services/AuthService";
import AppShell from "../../components/ui/AppShell";
import BackgroundFX from "../../components/ui/BackgroundFX";
import BottomBar, { BottomIcons } from "../../components/ui/BottomBar";

export default function STLayout() {
  const user = getCurrentUser();

  // Top bar (solo desktop) - 6 items
  const topNavDesktop = [
    { to: "/st",                 label: "Novedades", end: true },        // ✅ Ahora es el home
    { to: "/st/compras",         label: "Compras" },
    { to: "/st/solicitudes",     label: "Solicitudes" },                  // ✅ Cambiado a /st/solicitudes
    { to: "/st/nueva",           label: "Cargar Garantías" },
    { to: "/st/descargas",       label: "Descargas" },
    { to: "/st/capacitaciones",  label: "Capacitaciones" },
  ];

  // Bottom bar (solo mobile) - 4 items
  const bottomItems = [
    { to: "/st",                label: "Novedades",   icon: BottomIcons.novedades },   // ✅ Ahora es el home
    { to: "/st/compras",        label: "Compras",     icon: BottomIcons.compras },
    { to: "/st/solicitudes",    label: "Solicitudes", icon: BottomIcons.solicitudes }, // ✅ Cambiado a /st/solicitudes
    { to: "/st/nueva",          label: "Cargar",      icon: BottomIcons.cargar },
  ];

  return (
    <AppShell
      user={user}
      navItems={topNavDesktop}
      bottomBar={<BottomBar items={bottomItems} />}
    >
      <BackgroundFX />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </AppShell>
  );
}