// src/pages/admin/AdminST.jsx
export default function AdminST() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold mb-2">Servicios Técnicos</h2>
      <p className="text-gray-600">Crear / Editar / Eliminar ST.</p>
      <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
        <li>ABM de ST</li>
        <li>Reset de credenciales / permisos</li>
      </ul>
    </div>
  );
}
