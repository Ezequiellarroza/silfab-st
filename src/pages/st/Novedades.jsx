// src/pages/st/Novedades.jsx
import { useState, useEffect } from "react";
import { FiBell, FiCalendar, FiTag } from "react-icons/fi";
import { NewsAPI } from "../../services/ApiService";

export default function Novedades() {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNovedades();
  }, []);

  const loadNovedades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await NewsAPI.getNews();
      if (response.success) {
        setNovedades(response.data);
      }
    } catch (err) {
      console.error('Error cargando novedades:', err);
      setError('Error al cargar las novedades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <FiBell className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novedades</h1>
          <p className="text-sm text-gray-600">Mantente informado sobre actualizaciones y noticias</p>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando novedades...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Lista de novedades */}
      {!loading && !error && (
        <div className="space-y-4">
          {novedades.map((novedad) => (
            <div
              key={novedad.id}
              className={`bg-white rounded-lg border shadow-sm p-4 ${
                novedad.featured === 1 ? 'border-blue-500 border-2' : ''
              }`}
            >
              {/* Header de la novedad */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {novedad.featured === 1 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Destacado
                      </span>
                    )}
                    {novedad.category_name && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded flex items-center gap-1">
                        <FiTag size={12} />
                        {novedad.category_name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {novedad.title}
                  </h3>
                </div>
              </div>

              {/* Contenido */}
              <p className="text-gray-700 mb-3">
                {novedad.content}
              </p>

              {/* Imagen si existe */}
{novedad.image_url && (
  <div className="mb-3">
    {novedad.link_url ? (
      <a 
        href={novedad.link_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={NewsAPI.getImageUrl(novedad.image_url)}
          alt={novedad.title}
          className="rounded-lg max-w-full h-auto hover:opacity-90 transition-opacity cursor-pointer"
        />
      </a>
    ) : (
      <img
        src={NewsAPI.getImageUrl(novedad.image_url)}
        alt={novedad.title}
        className="rounded-lg max-w-full h-auto"
      />
    )}
  </div>
)}

              {/* Footer */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiCalendar size={14} />
                <span>{new Date(novedad.created_at).toLocaleDateString('es-AR', { 
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
      {!loading && !error && novedades.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBell className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No hay novedades disponibles</p>
        </div>
      )}
    </div>
  );
}