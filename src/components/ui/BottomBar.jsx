import { NavLink } from "react-router-dom";
import { FiFilePlus, FiFileText, FiShoppingCart, FiDownload, FiBell } from "react-icons/fi";

export default function BottomBar({ items = [] }) {
  // items: [{ to, label, icon }]
  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-40
        h-16
        bg-white/95 backdrop-blur
        border-t border-[var(--brand)]/20
        flex items-stretch justify-around
        md:hidden
      "
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            "flex flex-col items-center justify-center w-full gap-1 text-xs " +
            (isActive ? "text-[var(--brand)]" : "text-gray-600 hover:text-gray-900")
          }
        >
          <Icon size={20} />
          <span className="leading-none">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// Íconos sugeridos para reuse:
export const BottomIcons = {
  compras: FiShoppingCart,
  solicitudes: FiFileText,
  cargar: FiFilePlus,
  descargas: FiDownload,
  novedades: FiBell, // ✅ Nuevo ícono de campana para novedades
};