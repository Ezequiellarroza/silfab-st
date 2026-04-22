// helper: src/components/ui/NavItem.jsx
import { NavLink } from "react-router-dom";
export default function NavItem({ to, children }) {
  return (
  <NavLink
      to={to}
      end
      className={({ isActive }) =>
        "relative px-2 py-1 text-sm transition " +
        (isActive ? "text-[var(--brand)]" : "text-gray-600 hover:text-gray-900")
      }
    >
      {children}
    </NavLink>
  );
}
