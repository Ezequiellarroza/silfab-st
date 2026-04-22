// src/pages/LoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { getRedirectForRole } from "../utils/auth";
import { FiLock, FiUnlock } from "react-icons/fi";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);
  const [emailValue, setEmailValue] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("silfab_login_email");
    if (savedEmail) setEmailValue(savedEmail);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const { user, token } = await login({ email, password, remember });

      // recordar email si corresponde
      if (remember) localStorage.setItem("silfab_login_email", email);
      else localStorage.removeItem("silfab_login_email");

      // validación simple
      if (!token) throw new Error("Respuesta inválida del servidor");

      // Debug
      console.log('🔍 User role:', user.role);
      console.log('🔍 Redirect to:', getRedirectForRole(user.role));

      // 🚀 redirección SPA según rol
      navigate(getRedirectForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "No pudimos iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_0%,#e6f3fb_0%,#f8fafc_70%)]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex flex-col items-center">
            <img src="/logo-silfab.png" alt="Silfab" className="h-14 w-auto mb-4" />
            <h1 className="text-2xl font-semibold tracking-tight">Ingresá a tu cuenta</h1>
            <p className="mt-2 text-sm text-gray-500">Servicio Técnico de Silfab</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-[var(--card)] p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                />
              </div>

              <div className="relative">
                <label className="sr-only" htmlFor="password">Contraseña</label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center text-gray-500 hover:text-[var(--brand)]"
                >
                  {showPassword ? <FiUnlock size={18} /> : <FiLock size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[var(--brand)] focus:ring-[color:rgb(var(--ring))]"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Recordarme
                </label>
                <a href="/recuperar" className="text-sm font-medium text-[var(--brand)] hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}