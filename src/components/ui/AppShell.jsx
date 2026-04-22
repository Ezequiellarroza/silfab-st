// src/components/ui/AppShell.jsx
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../services/AuthService";

export default function AppShell({ user, navItems = [], bottomBar = null, children }) {
  const [open, setOpen] = useState(false);

  // Bloquea scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <div className="relative min-h-screen text-[var(--ink)]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white md:hidden transition"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <FiMenu />
            </button>
            <img src="/logo-silfab.png" alt="Silfab" className="h-7 w-auto" />
          </div>

          {/* Nav desktop */}
          <nav className="hidden gap-4 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  "relative px-2 py-1 text-sm transition " +
                  (isActive ? "text-[var(--brand)]" : "text-gray-600 hover:text-gray-900")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Perfil → ruta dinámica según rol */}
            <NavLink
              to={user?.role === "admin" ? "/admin/perfil" : "/st/perfil"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition"
              title="Perfil"
            >
              <FiUser />
            </NavLink>

            {/* Logout (solo desktop) */}
            <button
              onClick={() => { logout(); location.href = "/login"; }}
              className="hidden md:inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm text-white hover:bg-[var(--brand-600)] transition"
              title="Salir"
            >
              <FiLogOut /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* DRAWER MOBILE – fuera del header y con z-index alto */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              className="fixed inset-0 z-[90] bg-black/50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            {/* Aside sólido blanco */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-[100] w-80 max-w-[80%] bg-white shadow-xl border-r border-[var(--brand)]/20"
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <img src="/logo-silfab.png" alt="Silfab" className="h-7" />
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition"
                    onClick={() => setOpen(false)} aria-label="Cerrar menú"
                  >
                    <FiX />
                  </button>
                </div>

                <nav className="flex flex-col">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        "rounded-md px-3 py-2 text-[15px] transition " +
                        (isActive ? "bg-[var(--brand)]/10 text-[var(--brand)]" : "text-gray-700 hover:bg-gray-50")
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-6">
                  <button
                    onClick={() => { logout(); location.href = "/login"; }}
                    className="w-full rounded-md bg-[var(--brand)] px-3 py-2 text-sm text-white hover:bg-[var(--brand-600)] transition"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* CONTENIDO */}
      <div className="relative z-10">
        {children}
      </div>

      {/* BOTTOM BAR (solo mobile) */}
      {bottomBar}

      {/* Spacer para que el contenido no quede tapado por el bottom bar */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
