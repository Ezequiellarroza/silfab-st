// src/pages/st/compras/CatalogTab.jsx
import { useState, useEffect } from 'react';
import { ProductAPI, handleApiError } from '../../../services/ApiService';
import ProductCard from './ProductCard';
import { useCart } from '../../../contexts/CartContext';

export default function CatalogTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { openCart, itemCount } = useCart();

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
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="sticky top-[57px] z-10 bg-white pb-3">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <p className="text-gray-600">No se encontraron productos</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
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

      {/* Botón flotante del carrito */}
      {itemCount > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-20"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}