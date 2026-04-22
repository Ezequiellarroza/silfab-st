// src/pages/admin/AdminCapacitaciones.jsx
import { useState, useEffect, useRef } from "react";
import { FiBook, FiPlus, FiEdit2, FiArchive, FiX, FiImage, FiStar, FiFilter, FiExternalLink } from "react-icons/fi";
import { TrainingsAPI } from "../../services/ApiService";

export default function AdminCapacitaciones() {
  // Estado principal
  const [trainings, setTrainings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [showArchived, setShowArchived] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  
  // Estado del modal de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Campos del formulario
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [formButtonText, setFormButtonText] = useState('');
  const [formButtonUrl, setFormButtonUrl] = useState('');
  
  const fileInputRef = useRef(null);

  // Cargar datos al montar y cuando cambian filtros
  useEffect(() => {
    loadTrainings();
  }, [showArchived, filterCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await TrainingsAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  const loadTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (showArchived) params.archived = true;
      if (filterCategory) params.category_id = filterCategory;
      
      const response = await TrainingsAPI.getTrainings(params);
      if (response.success) {
        setTrainings(response.data);
      }
    } catch (err) {
      console.error('Error cargando capacitaciones:', err);
      setError('Error al cargar las capacitaciones');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingTraining(null);
    setFormTitle('');
    setFormContent('');
    setFormCategoryId('');
    setFormFeatured(false);
    setFormImage(null);
    setFormImagePreview(null);
    setCurrentImageUrl(null);
    setRemoveCurrentImage(false);
    setFormButtonText('');
    setFormButtonUrl('');
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (item) => {
    setEditingTraining(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormCategoryId(item.category_id || '');
    setFormFeatured(item.featured === 1 || item.featured === true);
    setFormImage(null);
    setFormImagePreview(null);
    setCurrentImageUrl(item.image_url ? TrainingsAPI.getImageUrl(item.image_url) : null);
    setRemoveCurrentImage(false);
    setFormButtonText(item.button_text || '');
    setFormButtonUrl(item.button_url || '');
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTraining(null);
    setFormTitle('');
    setFormContent('');
    setFormCategoryId('');
    setFormFeatured(false);
    setFormImage(null);
    setFormImagePreview(null);
    setCurrentImageUrl(null);
    setRemoveCurrentImage(false);
    setFormButtonText('');
    setFormButtonUrl('');
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten imágenes JPG, PNG o WEBP');
        return;
      }
      
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      
      setFormImage(file);
      setRemoveCurrentImage(false);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quitar imagen seleccionada
  const handleRemoveImage = () => {
    setFormImage(null);
    setFormImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Si hay imagen actual, marcar para eliminar
    if (currentImageUrl) {
      setRemoveCurrentImage(true);
    }
  };

  // Guardar capacitación
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formTitle.trim()) {
      alert('El título es requerido');
      return;
    }
    
    if (!formContent.trim()) {
      alert('El contenido es requerido');
      return;
    }
    
    try {
      setSaving(true);
      
      const data = {
        title: formTitle.trim(),
        content: formContent.trim(),
        category_id: formCategoryId || null,
        featured: formFeatured,
        button_text: formButtonText.trim() || null,
        button_url: formButtonUrl.trim() || null
      };
      
      if (editingTraining) {
        data.id = editingTraining.id;
        // Si no hay imagen nueva y no se quiere eliminar la actual, mantenerla
        if (!formImage && !removeCurrentImage && currentImageUrl) {
          data.keep_current_image = true;
        }
      }
      
      const response = await TrainingsAPI.saveTraining(data, formImage);
      
      if (response.success) {
        handleCloseModal();
        loadTrainings();
      }
    } catch (err) {
      console.error('Error guardando capacitación:', err);
      alert(err.message || 'Error al guardar la capacitación');
    } finally {
      setSaving(false);
    }
  };

  // Archivar/desarchivar
  const handleArchive = async (item) => {
    try {
      const response = await TrainingsAPI.archiveTraining(item.id);
      if (response.success) {
        loadTrainings();
      }
    } catch (err) {
      console.error('Error archivando capacitación:', err);
      alert(err.message || 'Error al archivar la capacitación');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FiBook className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Capacitaciones</h1>
            <p className="text-sm text-gray-600">Gestiona las capacitaciones para los servicios técnicos</p>
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FiPlus size={20} />
          <span>Nueva Capacitación</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>
        
        {/* Toggle Activas/Archivadas */}
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              !showArchived 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              showArchived 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Archivadas
          </button>
        </div>
        
        {/* Filtro por categoría */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando capacitaciones...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Lista de capacitaciones */}
      {!loading && !error && (
        <div className="space-y-4">
          {trainings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBook className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">
                {showArchived ? 'No hay capacitaciones archivadas' : 'No hay capacitaciones activas'}
              </p>
              {!showArchived && (
                <button
                  onClick={handleCreate}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Crear primera capacitación
                </button>
              )}
            </div>
          ) : (
            trainings.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg border shadow-sm overflow-hidden ${
                  item.featured ? 'border-purple-500 border-2' : ''
                }`}
              >
                <div className="p-4">
                  {/* Header de la card */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {item.featured === 1 && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded flex items-center gap-1">
                            <FiStar size={12} />
                            Destacado
                          </span>
                        )}
                        {item.category_name ? (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {item.category_name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                            Sin categoría
                          </span>
                        )}
                        {item.archived === 1 && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                            Archivada
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleArchive(item)}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title={item.archived ? 'Restaurar' : 'Archivar'}
                      >
                        <FiArchive size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <p className="text-gray-700 mb-3">{item.content}</p>
                  
                  {/* Imagen si existe */}
                  {item.image_url && (
                    <div className="mb-3">
                      <img
                        src={TrainingsAPI.getImageUrl(item.image_url)}
                        alt={item.title}
                        className="rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Botón si existe */}
                  {item.button_url && (
                    <div className="mb-3">
                      
                       <a href={item.button_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {item.button_text || 'Acceder'}
                        <FiExternalLink size={16} />
                      </a>
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="text-sm text-gray-500">
                    Creada el {formatDate(item.created_at)}
                    {item.updated_at !== item.created_at && (
                      <span> • Editada el {formatDate(item.updated_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTraining ? 'Editar Capacitación' : 'Nueva Capacitación'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Ej: Mantenimiento preventivo de equipos"
                  maxLength={255}
                />
              </div>
              
              {/* Contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  placeholder="Escribe la descripción de la capacitación..."
                />
              </div>
              
              {/* Categoría y Destacado en fila */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo / Categoría
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Marcar como destacada
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Botón: Texto y URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto del botón
                  </label>
                  <input
                    type="text"
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Ej: Ver Video, Descargar PDF"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del botón
                  </label>
                  <input
                    type="url"
                    value={formButtonUrl}
                    onChange={(e) => setFormButtonUrl(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 -mt-2">
                El botón solo aparecerá si se completa la URL. Puede ser un link a video, webinar, PDF, etc.
              </p>
              
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen / Flyer (opcional)
                </label>
                
                {/* Preview de imagen actual o nueva */}
                {(formImagePreview || (currentImageUrl && !removeCurrentImage)) && (
                  <div className="relative mb-3 inline-block">
                    <img
                      src={formImagePreview || currentImageUrl}
                      alt="Preview"
                      className="rounded-lg max-h-48 object-cover border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                
                {/* Input de archivo */}
                {!formImagePreview && (!currentImageUrl || removeCurrentImage) && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                  >
                    <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Haz clic para seleccionar una imagen
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG o WEBP (máx. 5MB)
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              
              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}