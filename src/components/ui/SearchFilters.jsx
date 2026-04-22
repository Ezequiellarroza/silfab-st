// src/components/ui/SearchFilters.jsx
import React from 'react';
import { Input } from './Input';
import Button from './Button';

/**
 * Componente SearchFilters
 * 
 * Componente reutilizable para filtros de búsqueda en solicitudes
 * Permite filtrar por SKU, ID, y rango de fechas
 * 
 * Props:
 * - filters: objeto con los valores actuales de los filtros
 * - onFiltersChange: función callback para actualizar los filtros
 * - onClearFilters: función callback para limpiar todos los filtros
 * - showSku, showId, showDateRange: flags para mostrar/ocultar campos específicos
 * - Labels y placeholders personalizables para cada campo
 */
export default function SearchFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  showSku = true,
  showId = true,
  showDateRange = true,
  skuLabel = "Modelo del producto",
  skuPlaceholder = "Ej: PROD-001",
  idLabel = "ID de solicitud",
  idPlaceholder = "Ej: 123",
  dateFromLabel = "Desde",
  dateToLabel = "Hasta",
  title = "🔍 Buscar solicitudes",
  // NUEVAS PROPS para hacer el campo más flexible
  searchLabel = null, // Si se provee, reemplaza skuLabel
  searchPlaceholder = null // Si se provee, reemplaza skuPlaceholder
}) {
  
  // Handler para cambios en el campo SKU/Búsqueda general
  // Actualiza el filtro SKU manteniendo los demás valores
  const handleSkuChange = (e) => {
    onFiltersChange({ ...filters, sku: e.target.value });
  };

  // Handler para cambios en el campo ID
  // Solo permite números y actualiza el filtro ID
  const handleIdChange = (e) => {
    // Eliminar cualquier caracter que no sea número (0-9)
    const value = e.target.value.replace(/[^0-9]/g, '');
    onFiltersChange({ ...filters, id: value });
  };

  // Handler para cambios en fecha desde
  const handleDateFromChange = (e) => {
    onFiltersChange({ ...filters, dateFrom: e.target.value });
  };

  // Handler para cambios en fecha hasta
  const handleDateToChange = (e) => {
    onFiltersChange({ ...filters, dateTo: e.target.value });
  };

  // Verificar si hay algún filtro activo para mostrar el botón "Limpiar"
  const hasActiveFilters = filters.sku || filters.id || filters.dateFrom || filters.dateTo;

  // Usar searchLabel/searchPlaceholder si se proveen, sino los defaults
  const finalSkuLabel = searchLabel || skuLabel;
  const finalSkuPlaceholder = searchPlaceholder || skuPlaceholder;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {title}
      </h3>
      
      {/* Diseño responsive: vertical en móvil, horizontal en desktop */}
      <div className="space-y-3 md:space-y-0 md:flex md:gap-3 md:items-end">
        
        {/* Campo de búsqueda por SKU/Modelo o búsqueda general */}
        {showSku && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {finalSkuLabel}
            </label>
            <Input
              type="text"
              placeholder={finalSkuPlaceholder}
              value={filters.sku}
              onChange={handleSkuChange}
            />
          </div>
        )}

        {/* Campo de búsqueda por ID */}
        {showId && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {idLabel}
            </label>
            <Input
              type="text"
              placeholder={idPlaceholder}
              value={filters.id}
              onChange={handleIdChange}
              inputMode="numeric" // Muestra teclado numérico en móviles
            />
          </div>
        )}

        {/* Campo de fecha desde */}
        {showDateRange && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {dateFromLabel}
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={handleDateFromChange}
            />
          </div>
        )}

        {/* Campo de fecha hasta */}
        {showDateRange && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {dateToLabel}
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={handleDateToChange}
            />
          </div>
        )}

        {/* Botón para limpiar todos los filtros */}
        {hasActiveFilters && (
          <div className="md:flex-shrink-0">
            <Button
              onClick={onClearFilters}
              className="w-full md:w-auto bg-gray-500 hover:bg-gray-600"
            >
              Limpiar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}