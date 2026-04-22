// src/pages/admin/AdminProductos.jsx
export default function AdminProductos() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold mb-2">Productos</h2>
      <p className="text-gray-600">Gestión de productos y repuestos.</p>
      <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
        <li>Catálogo (traído de BD/APIs)</li>
        <li>Asignación de repuestos por producto</li>
      </ul>
    </div>
  );
}
