// src/components/ui/BackgroundFX.jsx
import { useEffect, useRef } from "react";

export default function BackgroundFX() {
  const ref = useRef(null);

  useEffect(() => {
    // Efecto mínimo: podés dibujar algo en canvas, partículas, gradiente animado, etc.
    // Acá solo dejamos el hook por si querés animar luego.
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="
        pointer-events-none
        fixed inset-0
        -z-10
        bg-gradient-to-b from-white to-slate-50
      "
    />
  );
}
