import React, { useState, useEffect } from 'react';
import { RequestAPI, handleApiError } from '../../services/ApiService';
import SearchFilters from '../../components/ui/SearchFilters';
import RequestTypeBadge from '../../components/ui/RequestTypeBadge';

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
 * Componente RequestCard
 * 
 * Tarjeta que muestra toda la información de una solicitud de servicio técnico
 * Incluye: producto, estado, tipo, fechas, falla, repuestos y archivos adjuntos
 */
const RequestCard = ({ request }) => {
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
      {/* Encabezado: Nombre del producto y badges de tipo y estado */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">
            {request.product_name}
          </h3>
          <p className="text-sm text-gray-600">SKU: {request.product_sku}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <RequestTypeBadge type={request.request_type} />
          <StatusBadge status={request.status} />
        </div>
      </div>
      
      {/* Grid de información principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <p><strong>N° Serie:</strong> {request.serial_number || 'N/A'}</p>
          <p><strong>Garantía:</strong> {request.product_warranty_days ? `${request.product_warranty_days} días` : 'Consultar especificaciones'}</p>
        </div>
        <div>
          <p><strong>Creada:</strong> {formatDate(request.created_at)}</p>
          <p><strong>ID:</strong> #{request.id}</p>
        </div>
      </div>
      
      {/* Descripción de la falla reportada */}
      <div className="mt-3">
        <p className="text-sm"><strong>Falla:</strong></p>
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
      
      {/* Archivos adjuntos (factura, garantía, imágenes) */}
      {request.uploaded_files && (request.uploaded_files.factura || request.uploaded_files.garantia || request.uploaded_files.imagenes) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm font-medium mb-1">Archivos adjuntos:</p>
          <div className="text-xs text-gray-600">
            {request.uploaded_files.factura && <span className="mr-3">📄 Factura</span>}
            {request.uploaded_files.garantia && <span className="mr-3">📋 Garantía</span>}
            {request.uploaded_files.imagenes && <span className="mr-3">📷 Imágenes</span>}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente principal STSolicitudes
 * 
 * Muestra el historial de solicitudes de servicio técnico del usuario
 * Permite filtrar por estado, tipo, SKU, ID y fechas
 */
export const STSolicitudes = () => {
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
  
  // Estado de filtros de búsqueda con persistencia en localStorage
  // Inicializa desde localStorage si existe, sino valores vacíos
  const [searchFilters, setSearchFilters] = useState(() => {
    const saved = localStorage.getItem('st_search_filters');
    return saved ? JSON.parse(saved) : { 
      sku: '',      // Búsqueda por modelo/SKU de producto
      id: '',       // Búsqueda por ID de solicitud
      dateFrom: '', // Filtro fecha desde
      dateTo: ''    // Filtro fecha hasta
    };
  });

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    loadRequests();
  }, []);

  // Guardar filtros en localStorage cuando cambien
  // Permite mantener los filtros entre sesiones
  useEffect(() => {
    localStorage.setItem('st_search_filters', JSON.stringify(searchFilters));
  }, [searchFilters]);

  /**
   * Función para cargar solicitudes desde la API
   * Obtiene las últimas 50 solicitudes del usuario
   */
  const loadRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await RequestAPI.getRequests(50, 1);
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
   * Filtra por: estado, tipo, SKU, ID y rango de fechas
   * Retorna el array de solicitudes filtradas
   */
  const getFilteredRequests = () => {
    let filtered = requests;

    // Filtro por estado (pendiente, en_revision, aprobado, etc.)
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

    // Filtro por SKU - búsqueda parcial (contiene el texto)
    if (searchFilters.sku) {
      const skuLower = searchFilters.sku.toLowerCase();
      filtered = filtered.filter(req => 
        req.product_sku?.toLowerCase().includes(skuLower)
      );
    }

    // Filtro por ID - búsqueda parcial (contiene los números)
    if (searchFilters.id) {
      filtered = filtered.filter(req => 
        req.id.toString().includes(searchFilters.id)
      );
    }

    // Filtro por fecha desde - incluye solicitudes desde esta fecha
    if (searchFilters.dateFrom) {
      const fromDate = new Date(searchFilters.dateFrom);
      fromDate.setHours(0, 0, 0, 0); // Inicio del día
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at);
        reqDate.setHours(0, 0, 0, 0);
        return reqDate >= fromDate;
      });
    }

    // Filtro por fecha hasta - incluye solicitudes hasta esta fecha
    if (searchFilters.dateTo) {
      const toDate = new Date(searchFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Fin del día
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at);
        return reqDate <= toDate;
      });
    }

    return filtered;
  };

  /**
   * Limpiar todos los filtros de búsqueda
   * Resetea SKU, ID y fechas a valores vacíos
   */
  const handleClearFilters = () => {
    setSearchFilters({ 
      sku: '', 
      id: '',
      dateFrom: '', 
      dateTo: '' 
    });
  };

  // Obtener solicitudes filtradas según los filtros activos
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Mis Solicitudes de ST</h1>
        <p className="text-gray-600">Historial y estado de tus solicitudes de Servicio Técnico</p>
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

      {/* Componente reutilizable de filtros de búsqueda */}
      <SearchFilters
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        onClearFilters={handleClearFilters}
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
            {searchFilters.sku || searchFilters.id || searchFilters.dateFrom || searchFilters.dateTo
              ? 'Intenta ajustar los filtros de búsqueda.'
              : statusFilter === 'todas' && typeFilter === 'todas'
                ? 'Aún no has creado ninguna solicitud de Servicio Técnico.'
                : `No tienes solicitudes con los filtros seleccionados.`
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
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};