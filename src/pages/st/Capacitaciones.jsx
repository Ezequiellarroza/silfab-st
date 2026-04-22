// src/pages/st/Capacitaciones.jsx
import { useState, useEffect } from "react";
import { FiBook, FiCalendar, FiTag, FiExternalLink } from "react-icons/fi";
import { TrainingsAPI } from "../../services/ApiService";

export default function Capacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCapacitaciones();
  }, []);

  const loadCapacitaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TrainingsAPI.getTrainings();
      if (response.success) {
        setCapacitaciones(response.data);
      }
    } catch (err) {
      console.error('Error cargando capacitaciones:', err);
      setError('Error al cargar las capacitaciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <FiBook className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacitaciones</h1>
          <p className="text-sm text-gray-600">Recursos de formación para servicios técnicos</p>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando capacitaciones...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Lista de capacitaciones */}
      {!loading && !error && (
        <div className="space-y-4">
          {capacitaciones.map((capacitacion) => (
            <div
              key={capacitacion.id}
              className={`bg-white rounded-lg border shadow-sm p-4 ${
                capacitacion.featured === 1 ? 'border-purple-500 border-2' : ''
              }`}
            >
              {/* Header de la capacitación */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {capacitacion.featured === 1 && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        Destacado
                      </span>
                    )}
                    {capacitacion.category_name && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded flex items-center gap-1">
                        <FiTag size={12} />
                        {capacitacion.category_name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {capacitacion.title}
                  </h3>
                </div>
              </div>

              {/* Contenido */}
              <p className="text-gray-700 mb-3">
                {capacitacion.content}
              </p>

              {/* Imagen si existe */}
              {capacitacion.image_url && (
                <div className="mb-3">
                  <img
                    src={TrainingsAPI.getImageUrl(capacitacion.image_url)}
                    alt={capacitacion.title}
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}

              {/* Botón si existe */}
              {capacitacion.button_url && (
                <div className="mb-3">
                  
                   <a href={capacitacion.button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {capacitacion.button_text || 'Acceder'}
                    <FiExternalLink size={16} />
                  </a>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiCalendar size={14} />
                <span>{new Date(capacitacion.created_at).toLocaleDateString('es-AR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && !error && capacitaciones.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBook className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No hay capacitaciones disponibles</p>
        </div>
      )}
    </div>
  );
}