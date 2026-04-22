// src/pages/common/Perfil.jsx
import { getCurrentUser } from "../../services/AuthService";
export default function Perfil() {
  const u = getCurrentUser();
  return (
    <div className="rounded-xl border bg-white/90 p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Mi perfil</h2>
      <p className="mt-2 text-sm text-gray-700">Nombre: {u?.name || "Usuario"}</p>
      <p className="text-sm text-gray-700">Email: {u?.email}</p>
      <p className="text-sm text-gray-700">Rol: {u?.role}</p>
    </div>
  );
}
