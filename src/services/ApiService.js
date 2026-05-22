// src/services/ApiService.js - VERSIÓN CON SOPORTE PARA ARCHIVOS
import { getToken, getCurrentUser } from './AuthService';

// CAMBIAR ESTA URL SEGÚN EL ENTORNO
const API_BASE_URL = 'https://trinity.com.ar/silfab-api/endpoints';

// Helper para hacer requests con autenticación
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  // SOLUCIÓN: Pasar token en URL porque el servidor no recibe Authorization header
  const separator = endpoint.includes('?') ? '&' : '?';
  const urlWithToken = `${endpoint}${separator}token=${encodeURIComponent(token)}`;

  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Mantener header por si acaso funciona
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🚀 API Request: ${API_BASE_URL}${urlWithToken}`);
    console.log('🔑 Token in URL:', token);
    
    const response = await fetch(`${API_BASE_URL}${urlWithToken}`, config);
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// API para productos
export const ProductAPI = {
  // Obtener producto por SKU
  async getProductBySKU(sku) {
    if (!sku) throw new Error('SKU es requerido');
    return await apiRequest(`/get_product.php?sku=${encodeURIComponent(sku)}`);
  },
  
  // Obtener repuestos por SKU
  async getPartsBySKU(sku) {
    if (!sku) throw new Error('SKU es requerido');
    return await apiRequest(`/get_parts.php?sku=${encodeURIComponent(sku)}`);
  },

  // ============================================
  // NUEVAS FUNCIONES PARA SISTEMA DE COMPRAS
  // ============================================

  // Obtener todos los productos con paginación y búsqueda
  async getAllProducts(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.search && { search: params.search }),
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order })
    });

    return await apiRequest(`/get_all_products.php?${queryParams}`);
  },

  // Obtener repuestos por product_id
  async getPartsByProductId(productId) {
    if (!productId) throw new Error('Product ID es requerido');
    return await apiRequest(`/get_parts.php?product_id=${productId}`);
  },

  async searchProducts(q) {
    if (!q || q.length < 3) return { success: true, products: [] };
    return await apiRequest(`/search_products.php?q=${encodeURIComponent(q)}`);
  }
};

// API para solicitudes de garantía
export const RequestAPI = {
  // ============================================
  // MODIFICADO: Crear nueva solicitud CON SOPORTE PARA ARCHIVOS
  // ============================================
  async createRequest(requestData, files = null) {
    const token = getToken();

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    console.log('📤 Enviando con FormData');

    const formData = new FormData();

    formData.append('user_name', requestData.user_name);
    formData.append('user_email', requestData.user_email);
    formData.append('product_sku', requestData.product_sku);
    formData.append('product_name', requestData.product_name);
    formData.append('serial_number', requestData.serial_number);
    formData.append('purchase_date', requestData.purchase_date || '');
    formData.append('warranty_number', requestData.warranty_number || 'N/A');
    formData.append('fault_description', requestData.fault_description);
    formData.append('request_type', requestData.request_type);
    formData.append('selected_parts', JSON.stringify(requestData.selected_parts || []));

    if (files?.factura) formData.append('factura', files.factura);
    if (files?.garantia) formData.append('garantia', files.garantia);
    if (files?.imagenes) formData.append('imagenes', files.imagenes);

    const urlWithToken = `/save_request.php?token=${encodeURIComponent(token)}`;

    try {
      console.log(`🚀 API Request: ${API_BASE_URL}${urlWithToken}`);

      const response = await fetch(`${API_BASE_URL}${urlWithToken}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        // NO incluir Content-Type — lo setea el browser automáticamente con el boundary
        body: formData
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;

    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  },
  
  // Obtener solicitudes del usuario logueado
  async getRequests(limit = 50, page = 1) {
    const user = getCurrentUser();
    const offset = (page - 1) * limit;
    
    // Removemos user_id del query porque el backend lo determina por el token
    let url = `/get_requests.php?limit=${limit}&page=${page}`;
    
    return await apiRequest(url);
  },

  // ============================================
  // NUEVA FUNCIÓN PARA CAMBIAR ESTADO (ADMIN)
  // ============================================
  
  /**
   * Actualizar estado de una solicitud
   * Solo para usuarios admin
   * 
   * @param {number} requestId - ID de la solicitud
   * @param {string} newStatus - Nuevo estado (pendiente, en_revision, aprobado, rechazado, completado)
   * @param {string} comment - Comentario opcional sobre el cambio
   * @returns {Promise} Respuesta del servidor con la solicitud actualizada
   */
  async updateRequestStatus(requestId, newStatus, comment = '') {
    if (!requestId) throw new Error('ID de solicitud es requerido');
    if (!newStatus) throw new Error('Nuevo estado es requerido');
    
    const validStatuses = ['pendiente', 'en_revision', 'aprobado', 'rechazado', 'completado'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado no válido');
    }
    
    return await apiRequest('/update_request_status.php', {
      method: 'POST',
      body: JSON.stringify({
        request_id: requestId,
        new_status: newStatus,
        comment: comment
      })
    });
  },

  // ============================================
  // NUEVA FUNCIÓN PARA DESCARGAR ARCHIVOS
  // ============================================
  
  /**
   * Obtener URL de descarga para un archivo adjunto
   * 
   * @param {number} requestId - ID de la solicitud
   * @param {string} fileType - Tipo de archivo (factura, garantia, imagenes)
   * @returns {string} URL completa para descargar el archivo
   */
  getDownloadUrl(requestId, fileType) {
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    return `${API_BASE_URL}/download_file.php?request_id=${requestId}&file_type=${fileType}&token=${encodeURIComponent(token)}`;
  }
};

// ============================================
// NUEVA API PARA SISTEMA DE COMPRAS
// ============================================
export const OrderAPI = {
  // Crear pedido de compra
  async createOrder(orderData) {
    return await apiRequest('/create_order.php', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Obtener pedidos del usuario
  async getOrders(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.date_from && { date_from: params.date_from }),
      ...(params.date_to && { date_to: params.date_to }),
      ...(params.order_id && { order_id: params.order_id }),
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order })
    });

    return await apiRequest(`/get_orders.php?${queryParams}`);
  }
};

// ============================================
// API PARA NOVEDADES Y CATEGORÍAS
// ============================================
export const NewsAPI = {
  // ============================================
  // CATEGORÍAS
  // ============================================
  
  // Obtener todas las categorías
  async getCategories() {
    return await apiRequest('/get_news_categories.php');
  },
  
  // Crear o editar categoría
  async saveCategory(categoryData) {
    return await apiRequest('/save_news_category.php', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },
  
  // Eliminar categoría
  async deleteCategory(id) {
    return await apiRequest('/delete_news_category.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  
  // ============================================
  // NOVEDADES
  // ============================================
  
  // Obtener novedades
  async getNews(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.archived) queryParams.append('archived', '1');
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    
    const queryString = queryParams.toString();
    const url = '/get_news.php' + (queryString ? `?${queryString}` : '');
    
    return await apiRequest(url);
  },
  
  // Crear o editar novedad (con soporte para imagen)
  async saveNews(newsData, imageFile = null) {
    const token = getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    let body;
    let headers = {
      'Authorization': `Bearer ${token}`,
    };
    
    // Si hay imagen, usar FormData
    if (imageFile) {
      console.log('📤 Enviando novedad con FormData (con imagen)');
      
      const formData = new FormData();
      
      if (newsData.id) formData.append('id', newsData.id);
formData.append('title', newsData.title);
formData.append('content', newsData.content);
if (newsData.category_id) formData.append('category_id', newsData.category_id);
formData.append('featured', newsData.featured ? '1' : '0');
if (newsData.link_url) formData.append('link_url', newsData.link_url);
formData.append('image', imageFile);
      
      body = formData;
      // No incluir Content-Type para FormData
      
    } else {
      console.log('📤 Enviando novedad con JSON (sin imagen nueva)');
      
      // Si es edición y quiere mantener la imagen actual
      if (newsData.id && newsData.keep_current_image) {
        const formData = new FormData();
        formData.append('id', newsData.id);
formData.append('title', newsData.title);
formData.append('content', newsData.content);
if (newsData.category_id) formData.append('category_id', newsData.category_id);
formData.append('featured', newsData.featured ? '1' : '0');
if (newsData.link_url) formData.append('link_url', newsData.link_url);
formData.append('keep_current_image', '1');
        
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(newsData);
      }
    }
    
    const separator = '/save_news.php'.includes('?') ? '&' : '?';
    const urlWithToken = `/save_news.php${separator}token=${encodeURIComponent(token)}`;
    
    try {
      console.log(`🚀 API Request: ${API_BASE_URL}${urlWithToken}`);
      
      const response = await fetch(`${API_BASE_URL}${urlWithToken}`, {
        method: 'POST',
        headers: headers,
        body: body
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  },
  
  // Archivar/desarchivar novedad
  async archiveNews(id) {
    return await apiRequest('/archive_news.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  
  // ============================================
  // HELPERS
  // ============================================
  
  // Obtener URL completa de imagen
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    // Si ya es URL completa, retornar tal cual
    if (imagePath.startsWith('http')) return imagePath;
    // Construir URL completa
    return `https://trinity.com.ar/silfab-api/${imagePath}`;
  }
};


// ============================================
// API PARA CAPACITACIONES
// ============================================
export const TrainingsAPI = {
  // ============================================
  // CATEGORÍAS
  // ============================================
  
  // Obtener todas las categorías
  async getCategories() {
    return await apiRequest('/get_training_categories.php');
  },
  
  // Crear o editar categoría
  async saveCategory(categoryData) {
    return await apiRequest('/save_training_category.php', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },
  
  // Eliminar categoría
  async deleteCategory(id) {
    return await apiRequest('/delete_training_category.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  
  // ============================================
  // CAPACITACIONES
  // ============================================
  
  // Obtener capacitaciones
  async getTrainings(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.archived) queryParams.append('archived', '1');
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    
    const queryString = queryParams.toString();
    const url = '/get_trainings.php' + (queryString ? `?${queryString}` : '');
    
    return await apiRequest(url);
  },
  
  // Crear o editar capacitación (con soporte para imagen)
  async saveTraining(trainingData, imageFile = null) {
    const token = getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    let body;
    let headers = {
      'Authorization': `Bearer ${token}`,
    };
    
    // Si hay imagen, usar FormData
    if (imageFile) {
      console.log('📤 Enviando capacitación con FormData (con imagen)');
      
      const formData = new FormData();
      
      if (trainingData.id) formData.append('id', trainingData.id);
      formData.append('title', trainingData.title);
      formData.append('content', trainingData.content);
      if (trainingData.category_id) formData.append('category_id', trainingData.category_id);
      formData.append('featured', trainingData.featured ? '1' : '0');
      if (trainingData.button_text) formData.append('button_text', trainingData.button_text);
      if (trainingData.button_url) formData.append('button_url', trainingData.button_url);
      formData.append('image', imageFile);
      
      body = formData;
      // No incluir Content-Type para FormData
      
    } else {
      console.log('📤 Enviando capacitación con JSON (sin imagen nueva)');
      
      // Si es edición y quiere mantener la imagen actual
      if (trainingData.id && trainingData.keep_current_image) {
        const formData = new FormData();
        formData.append('id', trainingData.id);
        formData.append('title', trainingData.title);
        formData.append('content', trainingData.content);
        if (trainingData.category_id) formData.append('category_id', trainingData.category_id);
        formData.append('featured', trainingData.featured ? '1' : '0');
        if (trainingData.button_text) formData.append('button_text', trainingData.button_text);
        if (trainingData.button_url) formData.append('button_url', trainingData.button_url);
        formData.append('keep_current_image', '1');
        
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(trainingData);
      }
    }
    
    const separator = '/save_training.php'.includes('?') ? '&' : '?';
    const urlWithToken = `/save_training.php${separator}token=${encodeURIComponent(token)}`;
    
    try {
      console.log(`🚀 API Request: ${API_BASE_URL}${urlWithToken}`);
      
      const response = await fetch(`${API_BASE_URL}${urlWithToken}`, {
        method: 'POST',
        headers: headers,
        body: body
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  },
  
  // Archivar/desarchivar capacitación
  async archiveTraining(id) {
    return await apiRequest('/archive_training.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  
  // ============================================
  // HELPERS
  // ============================================
  
  // Obtener URL completa de imagen
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    // Si ya es URL completa, retornar tal cual
    if (imagePath.startsWith('http')) return imagePath;
    // Construir URL completa
    return `https://trinity.com.ar/silfab-api/${imagePath}`;
  }
};
// Helper para manejar errores de conexión
export const handleApiError = (error) => {
  console.error('🚨 Handling API Error:', error);
  
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return 'No se puede conectar con el servidor. Verifica tu conexión.';
  }
  
  if (error.message.includes('Token de autenticación inválido')) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
  }
  
  if (error.message.includes('CORS')) {
    return 'Error de configuración del servidor. Contacta al administrador.';
  }
  
  return error.message || 'Error desconocido en la API';
};