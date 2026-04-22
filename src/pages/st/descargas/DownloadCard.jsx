// src/pages/st/descargas/DownloadCard.jsx
import { useState } from 'react';
import { FiDownload, FiFileText, FiImage } from 'react-icons/fi';

export default function DownloadCard({ product }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = (url, type) => {
    if (!url) return;
    
    // Abrir en nueva pestaña para descargar
    window.open(url, '_blank');
  };

  // Verificar si tiene al menos una descarga disponible
  const hasDownloads = product.documentation_url || product.images_url;

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header del producto */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Imagen */}
          <img
            src={product.imagen || 'https://placehold.co/80x80/dddddd/333333?text=NO-IMG'}
            alt={product.nombre}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            loading="lazy"
          />
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {product.nombre}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  SKU: {product.sku}
                </p>
                {product.categoria && (
                  <p className="text-xs text-gray-500 mt-1">
                    {product.categoria}
                  </p>
                )}
              </div>
              
              {/* Icono expandir */}
              <svg
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Descargas (expandible) */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          {!hasDownloads ? (
            <div className="text-center py-4 text-sm text-gray-600">
              No hay descargas disponibles para este producto
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Descargas disponibles:
              </h4>

              {/* Botón Documentación */}
              {product.documentation_url && (
                <button
                  onClick={() => handleDownload(product.documentation_url, 'documentation')}
                  className="w-full flex items-center justify-between gap-3 p-3 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FiFileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Documentación</p>
                      <p className="text-xs text-gray-600">Manuales y especificaciones técnicas</p>
                    </div>
                  </div>
                  <FiDownload className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>
              )}

              {/* Botón Imágenes */}
              {product.images_url && (
                <button
                  onClick={() => handleDownload(product.images_url, 'images')}
                  className="w-full flex items-center justify-between gap-3 p-3 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <FiImage className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Imágenes</p>
                      <p className="text-xs text-gray-600">Galería de fotos del producto</p>
                    </div>
                  </div>
                  <FiDownload className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}