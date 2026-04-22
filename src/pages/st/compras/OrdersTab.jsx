// src/pages/st/compras/OrdersTab.jsx
import { useState, useEffect } from 'react';
import { OrderAPI, handleApiError } from '../../../services/ApiService';
import OrderCard from './OrderCard';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Cargar pedidos
  const loadOrders = async (page = 1, status = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await OrderAPI.getOrders({
        page,
        limit: 20,
        status: status || undefined,
        sort: 'created_at',
        order: 'desc'
      });

      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      } else {
        setError(response.error || 'Error al cargar pedidos');
      }
    } catch (err) {
      setError(handleApiError(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos inicial
  useEffect(() => {
    loadOrders(1, '');
  }, []);

  // Cambiar filtro de estado
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    loadOrders(1, status);
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    loadOrders(newPage, statusFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {/* Filtros de estado */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleStatusFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => handleStatusFilter('pendiente')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'pendiente'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => handleStatusFilter('procesando')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'procesando'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Procesando
        </button>
        <button
          onClick={() => handleStatusFilter('enviado')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'enviado'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Enviados
        </button>
        <button
          onClick={() => handleStatusFilter('completado')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'completado'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completados
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando pedidos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Lista de pedidos */}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600">No hay pedidos{statusFilter && ` con estado "${statusFilter}"`}</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Paginación */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.has_prev}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.current_page} de {pagination.total_pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_next}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}