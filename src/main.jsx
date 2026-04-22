// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 👇 Import del helper que inyecta el plugin (opcional si querés hooks)
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Mostrá un toast/botón para recargar si querés UX “Apple-like”
    if (confirm('Hay una nueva versión disponible. ¿Actualizar?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('La app está lista para offline ✅')
  },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
