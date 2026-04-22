// src/utils/auth.js
import { getCurrentUser } from "../services/AuthService";

export function getRedirectForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "servicio_tecnico") return "/st";
  return "/login";
}

/**
 * Dado el usuario guardado, indica la landing adecuada.
 * Si no hay sesión, devuelve /login.
 */
export function getHomeForCurrentUser() {
  const u = getCurrentUser();
  return u ? getRedirectForRole(u.role) : "/login";
}