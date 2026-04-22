import React, { useState, useEffect } from 'react';
import { RequestAPI, handleApiError } from '../../services/ApiService';
import { useNotification } from '../../contexts/NotificationContext';
import SearchFilters from '../../components/ui/SearchFilters';
import Button from '../../components/ui/Button';
import RequestTypeBadge from '../../components/ui/RequestTypeBadge';
import { FiDownload, FiFileText, FiImage, FiEdit3, FiUser, FiMail } from 'react-icons/fi';

/**
 * Componente StatusBadge
 * 
 * Muestra un badge colorido según el estado de la solicitud
 * Estados posibles: pendiente, en_revision, aprobado, rechazado, completado
 */
const StatusBadge = ({ status }) => {
  // Configuración de colores y textos por estado
  const statusConfig = {
    'pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
    'en_revision': { color: 'bg-blue-100 text-blue-800', text: 'En Revisión' },
    'aprobado': { color: 'bg-green-100 text-green-800', text: 'Aprobado' },
    'rechazado': { color: 'bg-red-100 text-red-800', text: 'Rechazado' },
    'completado': { color: 'bg-gray-100 text-gray-800', text: 'Completado' }
  };
  
  // Si el estado no existe en la config, usar 'pendiente' por defecto
  const config = statusConfig[status] || statusConfig['pendiente'];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

/**
 * Componente ChangeStatusModal
 * 
 * Modal standalone para cambiar el estado de una solicitud
 * NO usa el componente Modal genérico, tiene su propia estructura
 */
const ChangeStatusModal = ({ isOpen, onClose, request, onConfirm }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // Inicializar el estado seleccionado cuando se abre el modal
  useEffect(() => {
    if (isOpen && request) {
      setSelectedStatus(request.status);
      setComment('');
    }
  }, [isOpen, request]);

  // Estados disponibles para seleccionar
  const availableStatuses = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'completado', label: 'Completado' }
  ];

  const handleConfirm = async () => {
    // Validar que el estado haya cambiado
    if (selectedStatus === request.status) {
      showNotification({
        type: 'warning',
        message: 'Debes seleccionar un estado diferente al actual'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onConfirm({
        requestId: request.id,
        newStatus: selectedStatus,
        comment: comment.trim()
      });
      onClose();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // No renderizar nada si el modal no está abierto o no hay request
  if (!isOpen || !request) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Cambiar Estado de Solicitud
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Información de la solicitud con badge de tipo */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Solicitud #{request.id} - {request.product_name}
                </p>
                <RequestTypeBadge type={request.request_type} />
              </div>
              <p className="text-xs text-gray-600">
                Técnico: {request.user_name}
              </p>
            </div>

            {/* Estado actual (disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado Actual
              </label>
              <input
                type="text"
                value={request.status}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* Selector de nuevo estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuevo Estado *
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Comentario opcional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agrega un comentario sobre este cambio..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Componente AdminRequestCard
 * 
 * Tarjeta extendida para admin que muestra toda la información de una solicitud
 * Incluye: info del técnico, datos de la solicitud, botones de descarga y cambio de estado
 */
const AdminRequestCard = ({ request, onChangeStatus }) => {
  // Función para formatear fecha en formato argentino
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      {/* Encabezado: Info del técnico y badges */}
      <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
        <div className="flex-1">
          {/* Info del técnico */}
          <div className="flex items-center gap-2 mb-2">
            <FiUser className="text-gray-500" size={16} />
            <span className="text-sm font-medium text-gray-700">
              {request.user_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiMail className="text-gray-500" size={16} />
            <span className="text-xs text-gray-600">
              {request.user_email}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <RequestTypeBadge type={request.request_type} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Información del producto */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-800">
          {request.product_name}
        </h3>
        <p className="text-sm text-gray-600">SKU: {request.product_sku}</p>
      </div>
      
      {/* Grid de información principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <p><strong>N° Serie:</strong> {request.serial_number || 'N/A'}</p>
          <p><strong>N° Garantía:</strong> {request.warranty_number || 'N/A'}</p>
        </div>
        <div>
          <p><strong>Creada:</strong> {formatDate(request.created_at)}</p>
          <p><strong>ID:</strong> #{request.id}</p>
        </div>
      </div>
      
      {/* Descripción de la falla reportada */}
      <div className="mt-3">
        <p className="text-sm"><strong>Falla reportada:</strong></p>
        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
          {request.fault_description}
        </p>
      </div>
      
      {/* Lista de repuestos solicitados - Solo mostrar si el tipo es 'repuestos' */}
      {request.request_type === 'repuestos' && request.selected_parts && request.selected_parts.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium">Repuestos solicitados:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {request.selected_parts.map((repuesto, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {repuesto.codigo || repuesto}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Archivos adjuntos con botones de descarga FUNCIONALES */}
      {request.uploaded_files && (request.uploaded_files.factura || request.uploaded_files.garantia || request.uploaded_files.imagenes) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm font-medium mb-2">Archivos adjuntos:</p>
          <div className="flex flex-wrap gap-2">
            {request.uploaded_files.factura && (
              <a
                href={RequestAPI.getDownloadUrl(request.id, 'factura')}
                download
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
              >
                <FiFileText size={16} />
                <span>Factura</span>
                <FiDownload size={14} />
              </a>
            )}
            {request.uploaded_files.garantia && (
              <a
                href={RequestAPI.getDownloadUrl(request.id, 'garantia')}
                download
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
              >
                <FiFileText size={16} />
                <span>Garantía</span>
                <FiDownload size={14} />
              </a>
            )}
            {request.uploaded_files.imagenes && (
              <a
                href={RequestAPI.getDownloadUrl(request.id, 'imagenes')}
                download
                className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200 transition-colors"
              >
                <FiImage size={16} />
                <span>Imágenes</span>
                <FiDownload size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Sección de comentarios (placeholder) */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-600 mb-1">Comentarios:</p>
        <p className="text-xs text-gray-500 italic">
          Sin comentarios aún
        </p>
      </div>

      {/* Botón para cambiar estado */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          onClick={() => onChangeStatus(request)}
          className="w-full flex items-center justify-center gap-2"
        >
          <FiEdit3 size={16} />
          Cambiar Estado
        </Button>
      </div>
    </div>
  );
};

/**
 * Componente principal AdminSolicitudes
 * 
 * Muestra todas las solicitudes de servicio técnico para el admin
 * Permite filtrar, buscar y cambiar el estado de las solicitudes
 */
export default function AdminSolicitudes() {
  // Estado para almacenar todas las solicitudes cargadas desde la API
  const [requests, setRequests] = useState([]);
  
  // Estado de carga para mostrar spinner/mensaje
  const [loading, setLoading] = useState(true);
  
  // Estado para manejar errores de la API
  const [error, setError] = useState('');
  
  // Filtro de estado (pendiente, en_revision, aprobado, etc.)
  const [statusFilter, setStatusFilter] = useState('todas');
  
  // Filtro de tipo (repuestos, envio, todas)
  const [typeFilter, setTypeFilter] = useState('todas');
  
  // Estado para el modal de cambio de estado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Hook de notificaciones
  const { showNotification } = useNotification();
  
  // Estado de filtros de búsqueda con persistencia en localStorage
  const [searchFilters, setSearchFilters] = useState(() => {
    const saved = localStorage.getItem('admin_search_filters');
    return saved ? JSON.parse(saved) : { 
      sku: '',      // Búsqueda general: SKU, ID o técnico
      id: '',       // No se usa pero se mantiene para compatibilidad
      dateFrom: '', // Filtro fecha desde
      dateTo: ''    // Filtro fecha hasta
    };
  });

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    loadRequests();
  }, []);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('admin_search_filters', JSON.stringify(searchFilters));
  }, [searchFilters]);

  /**
   * Función para cargar solicitudes desde la API
   * Como admin, obtiene TODAS las solicitudes
   */
  const loadRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await RequestAPI.getRequests(100, 1); // Admin ve más solicitudes
      setRequests(data.data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función que aplica todos los filtros activos a las solicitudes
   * Filtra por: estado, tipo, búsqueda general (SKU/ID/técnico) y rango de fechas
   */
  const getFilteredRequests = () => {
    let filtered = requests;

    // Filtro por estado
    if (statusFilter !== 'todas') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filtro por tipo (repuestos, envio)
    if (typeFilter !== 'todas') {
      filtered = filtered.filter(req => {
        // Si no tiene request_type, asumir 'repuestos' (compatibilidad con datos antiguos)
        const requestTypeValue = req.request_type || 'repuestos';
        return requestTypeValue === typeFilter;
      });
    }

    // Filtro de búsqueda general (SKU, ID o técnico)
    if (searchFilters.sku) {
      const searchTerm = searchFilters.sku.toLowerCase();
      filtered = filtered.filter(req => 
        req.product_sku?.toLowerCase().includes(searchTerm) ||
        req.id.toString().includes(searchTerm) ||
        req.user_name?.toLowerCase().includes(searchTerm) ||
        req.user_email?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por fecha desde
    if (searchFilters.dateFrom) {
      const fromDate = new Date(searchFilters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at);
        reqDate.setHours(0, 0, 0, 0);
        return reqDate >= fromDate;
      });
    }

    // Filtro por fecha hasta
    if (searchFilters.dateTo) {
      const toDate = new Date(searchFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at);
        return reqDate <= toDate;
      });
    }

    return filtered;
  };

  /**
   * Limpiar todos los filtros de búsqueda
   */
  const handleClearFilters = () => {
    setSearchFilters({ 
      sku: '', 
      id: '',
      dateFrom: '', 
      dateTo: '' 
    });
  };

  /**
   * Abrir modal para cambiar estado
   */
  const handleChangeStatus = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  /**
   * Confirmar cambio de estado
   */
  const handleConfirmStatusChange = async ({ requestId, newStatus, comment }) => {
    try {
      // Llamada real al endpoint
      const response = await RequestAPI.updateRequestStatus(requestId, newStatus, comment);
      
      // Actualizar el estado local con los datos del servidor
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId
            ? response.data
            : req
        )
      );
      
      // Mostrar notificación de éxito
      showNotification({
        type: 'success',
        message: `Estado actualizado a: ${newStatus}`
      });
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      
      // Mostrar notificación de error
      showNotification({
        type: 'error',
        message: handleApiError(error)
      });
      
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };

  // Obtener solicitudes filtradas
  const filteredRequests = getFilteredRequests();

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Título de la sección */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Solicitudes</h1>
        <p className="text-gray-600">Todas las solicitudes de Servicio Técnico</p>
      </div>

      {/* Mensaje de error si falla la carga */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
          <button 
            onClick={loadRequests}
            className="ml-2 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Componente de filtros de búsqueda */}
      <SearchFilters
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        onClearFilters={handleClearFilters}
        searchLabel="Buscar"
        searchPlaceholder="SKU, ID o técnico..."
        showId={false} // Ocultamos el campo ID separado
      />

      {/* Filtros de estado - botones de selección rápida */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'pendiente', label: 'Pendientes' },
            { key: 'en_revision', label: 'En Revisión' },
            { key: 'aprobado', label: 'Aprobadas' },
            { key: 'rechazado', label: 'Rechazadas' },
            { key: 'completado', label: 'Completadas' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setStatusFilter(filterOption.key)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                statusFilter === filterOption.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de tipo - botones de selección rápida */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Filtrar por tipo:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'todas', label: 'Todas', emoji: '' },
            { key: 'repuestos', label: 'Repuestos', emoji: '📦' },
            { key: 'envio', label: 'Envío', emoji: '🚚' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setTypeFilter(filterOption.key)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                typeFilter === filterOption.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterOption.emoji} {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de solicitudes o mensaje si no hay resultados */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            No se encontraron solicitudes
          </h2>
          <p className="text-gray-600 mt-2">
            {searchFilters.sku || searchFilters.dateFrom || searchFilters.dateTo
              ? 'Intenta ajustar los filtros de búsqueda.'
              : statusFilter === 'todas' && typeFilter === 'todas'
                ? 'Aún no hay solicitudes registradas.'
                : `No hay solicitudes con los filtros seleccionados.`
            }
          </p>
        </div>
      ) : (
        <div>
          {/* Contador de resultados */}
          <div className="mb-3 text-sm text-gray-600">
            {filteredRequests.length} solicitud{filteredRequests.length !== 1 ? 'es' : ''} encontrada{filteredRequests.length !== 1 ? 's' : ''}
            {requests.length !== filteredRequests.length && (
              <span className="text-gray-500"> de {requests.length} total{requests.length !== 1 ? 'es' : ''}</span>
            )}
          </div>
          
          {/* Tarjetas de solicitudes */}
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <AdminRequestCard 
                key={request.id} 
                request={request}
                onChangeStatus={handleChangeStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal para cambiar estado */}
      <ChangeStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}