// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("silfab_user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("silfab_token");
    localStorage.removeItem("silfab_user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo-silfab.png" alt="Silfab" className="h-8 w-auto" />
            <h1 className="text-lg font-semibold">Panel — Sistema Técnico</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:opacity-90"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-2 text-xl font-semibold">¡Bienvenido!</h2>
          <p className="text-gray-600">
            Esta es una vista de prueba. Cuando conectemos con las APIs de Silfab,
            acá listamos tickets, métricas, etc.
          </p>
        </div>
      </main>
    </div>
  );
}
