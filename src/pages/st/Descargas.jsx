// src/pages/st/Descargas.jsx
import { useState, useEffect } from 'react';
import { ProductAPI, handleApiError } from '../../services/ApiService';
import DownloadCard from './descargas/DownloadCard';
import { FiDownload } from 'react-icons/fi';

export default function Descargas() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar productos
  const loadProducts = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ProductAPI.getAllProducts({
        page,
        limit: 20,
        search: search.trim(),
        sort: 'nombre',
        order: 'asc'
      });

      if (response.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      } else {
        setError(response.error || 'Error al cargar productos');
      }
    } catch (err) {
      setError(handleApiError(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos inicial
  useEffect(() => {
    loadProducts(1, '');
  }, []);

  // Buscar con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length === 0 || searchTerm.length >= 2) {
        loadProducts(1, searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cambiar página
  const handlePageChange = (newPage) => {
    loadProducts(newPage, searchTerm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <FiDownload className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Descargas</h1>
          <p className="text-sm text-gray-600">Documentación e imágenes de productos</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg border p-4">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {pagination && (
          <p className="text-sm text-gray-600 mt-2">
            {pagination.total_products} productos encontrados
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando productos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Lista de productos */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDownload className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No se encontraron productos</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <DownloadCard key={product.id} product={product} />
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