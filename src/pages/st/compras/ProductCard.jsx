// src/pages/st/compras/ProductCard.jsx
import { useState, useEffect } from 'react';
import { ProductAPI, handleApiError } from '../../../services/ApiService';
import { useCart } from '../../../contexts/CartContext';

export default function ProductCard({ product }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();

  // Cargar repuestos cuando se expande
  useEffect(() => {
    if (isExpanded && parts.length === 0) {
      loadParts();
    }
  }, [isExpanded]);

  const loadParts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ProductAPI.getPartsByProductId(product.id);
      
      if (response.success) {
        setParts(response.data.parts || []);
      } else {
        setError(response.error || 'Error al cargar repuestos');
      }
    } catch (err) {
      setError(handleApiError(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (part) => {
    addToCart(part, product);
  };

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
                <p className="text-xs text-gray-500 mt-1">
                  Garantía: {product.warranty_days} días
                </p>
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

      {/* Repuestos (expandible) */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-600">
              Cargando repuestos...
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && parts.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-600">
              No hay repuestos disponibles
            </div>
          )}

          {!loading && !error && parts.length > 0 && (
            <div className="divide-y">
              {parts.map(part => (
                <div key={part.id} className="p-3 hover:bg-white transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {part.descripcion}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Código: {part.codigo}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-semibold text-blue-600">
                          ${parseFloat(part.precio).toFixed(2)}
                        </span>
                        <span className={`text-xs ${
                          part.stock > 5 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          Stock: {part.stock}
                        </span>
                        <span className="text-xs text-gray-500">
                          Máx: {part.max_cantidad}
                        </span>
                      </div>
                    </div>

                    {/* Botón agregar */}
                    <button
                      onClick={() => handleAddToCart(part)}
                      disabled={part.stock < 1}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      {part.stock < 1 ? 'Sin stock' : 'Agregar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}