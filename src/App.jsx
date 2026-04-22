// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getHomeForCurrentUser } from "./utils/auth";
import { NotificationProvider } from "./contexts/NotificationContext";  // 🆕 Importar
import { CartProvider } from "./contexts/CartContext";
import ToastContainer from "./components/ui/Toast";  // 🆕 Importar

import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./router/PrivateRoute";
import RequireRole from "./router/RequireRole";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminSolicitudes from "./pages/admin/AdminSolicitudes";
import AdminST from "./pages/admin/AdminST";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminNovedades from "./pages/admin/AdminNovedades";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminCapacitaciones from "./pages/admin/AdminCapacitaciones";
import AdminCapacitacionesCategorias from "./pages/admin/AdminCapacitacionesCategorias";

// ST
import STLayout from "./pages/st/STLayout";
import { STSolicitudes } from "./pages/st/STSolicitudes";
import { STNueva } from "./pages/st/STNueva";
import Novedades from './pages/st/Novedades';
import Capacitaciones from './pages/st/Capacitaciones';

// Extras
import STCompras from "./pages/st/Compras";
import STDescargas from "./pages/st/Descargas";
import Perfil from "./pages/common/Perfil";

function HomeRedirect() {
  const to = getHomeForCurrentUser();
  return <Navigate to={to} replace />;
}

export default function App() {
  return (
    <NotificationProvider>  {/* 🆕 Envolver TODO con NotificationProvider */}
      <CartProvider>
        <BrowserRouter>
          <ToastContainer />  {/* 🆕 Agregar ToastContainer */}
          
          <Routes>
            {/* Público */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <RequireRole roles={["admin"]}>
                    <AdminLayout />
                  </RequireRole>
                </PrivateRoute>
              }
            >
              <Route index element={<AdminSolicitudes />} />
              <Route path="servicios-tecnicos" element={<AdminST />} />
              <Route path="productos" element={<AdminProductos />} />
              <Route path="novedades" element={<AdminNovedades />} />
              <Route path="categorias" element={<AdminCategorias />} />
               <Route path="capacitaciones" element={<AdminCapacitaciones />} />
              <Route path="capacitaciones-categorias" element={<AdminCapacitacionesCategorias />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>

            {/* Servicio Técnico */}
            <Route
              path="/st"
              element={
                <PrivateRoute>
                  <RequireRole roles={["servicio_tecnico"]}>
                    <STLayout />
                  </RequireRole>
                </PrivateRoute>
              }
            >
              {/* ✅ CAMBIO: Ahora Novedades es la pantalla inicial */}
              <Route index element={<Novedades />} />
              
              {/* ✅ CAMBIO: Solicitudes ahora tiene ruta explícita */}
              <Route path="solicitudes" element={<STSolicitudes />} />
              
              <Route path="nueva" element={<STNueva />} />
              <Route path="compras" element={<STCompras />} />
              <Route path="descargas" element={<STDescargas />} />
              <Route path="perfil" element={<Perfil />} />
              
              {/* ✅ CORREGIDO: Sin /st/ duplicado */}
              <Route path="novedades" element={<Novedades />} />
              <Route path="capacitaciones" element={<Capacitaciones />} />
            </Route>

            {/* Home inteligente por rol */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </NotificationProvider>  
  );
}