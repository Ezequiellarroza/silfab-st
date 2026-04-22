// src/router/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/AuthService";

export default function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}
