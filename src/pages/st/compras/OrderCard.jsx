// src/pages/st/compras/OrderCard.jsx
import { useState } from 'react';

export default function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Colores según estado
  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      procesando: 'bg-blue-100 text-blue-800 border-blue-200',
      enviado: 'bg-purple-100 text-purple-800 border-purple-200',
      completado: 'bg-green-100 text-green-800 border-green-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Texto del estado
  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      procesando: 'Procesando',
      enviado: 'Enviado',
      completado: 'Completado',
      cancelado: 'Cancelado'
    };
    return texts[status] || status;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {order.order_number}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(order.created_at)}
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {order.total_items} {order.total_items === 1 ? 'item' : 'items'}
            </p>
            <p className="text-lg font-semibold text-blue-600 mt-1">
              ${parseFloat(order.total_amount).toFixed(2)}
            </p>
          </div>

          {/* Icono expandir */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
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

      {/* Detalles (expandible) */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* Items del pedido */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Items del pedido:</h4>
            <div className="space-y-2">
              {order.order_items.map((item, index) => (
                <div key={index} className="bg-white rounded p-3 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-2">
                        {item.descripcion}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.codigo}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-gray-900">
                        {item.cantidad}x ${parseFloat(item.precio_unitario).toFixed(2)}
                      </p>
                      <p className="text-xs text-blue-600 font-semibold mt-1">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dirección de envío */}
          {order.shipping_address && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Dirección de envío:</h4>
              <p className="text-sm text-gray-600 bg-white rounded p-2">
                {order.shipping_address}
              </p>
            </div>
          )}

          {/* Notas */}
          {order.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Notas:</h4>
              <p className="text-sm text-gray-600 bg-white rounded p-2">
                {order.notes}
              </p>
            </div>
          )}

          {/* Total */}
          <div className="pt-3 border-t flex justify-between items-center">
            <span className="font-medium text-gray-700">Total del pedido:</span>
            <span className="text-xl font-bold text-blue-600">
              ${parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}