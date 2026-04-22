// src/router/RequireRole.jsx
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/AuthService";

export default function RequireRole({ roles, children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? children : <Navigate to="/login" replace />;
}
