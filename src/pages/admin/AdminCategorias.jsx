// src/pages/admin/AdminCategorias.jsx
import { useState, useEffect } from "react";
import { FiTag, FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle } from "react-icons/fi";
import { NewsAPI } from "../../services/ApiService";

export default function AdminCategorias() {
  // Estado principal
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado del modal de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Estado del modal de confirmación de eliminar
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await NewsAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormName('');
  };

  // Guardar categoría (crear o editar)
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formName.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    try {
      setSaving(true);
      
      const data = {
        name: formName.trim()
      };
      
      if (editingCategory) {
        data.id = editingCategory.id;
      }
      
      const response = await NewsAPI.saveCategory(data);
      
      if (response.success) {
        handleCloseModal();
        loadCategories();
      }
    } catch (err) {
      console.error('Error guardando categoría:', err);
      alert(err.message || 'Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  // Abrir confirmación de eliminar
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setDeleting(true);
      const response = await NewsAPI.deleteCategory(categoryToDelete.id);
      
      if (response.success) {
        setShowDeleteConfirm(false);
        setCategoryToDelete(null);
        loadCategories();
        
        if (response.affected_news > 0) {
          alert(`Categoría eliminada. ${response.affected_news} novedad(es) quedaron sin categoría.`);
        }
      }
    } catch (err) {
      console.error('Error eliminando categoría:', err);
      alert(err.message || 'Error al eliminar la categoría');
    } finally {
      setDeleting(false);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FiTag className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
            <p className="text-sm text-gray-600">Gestiona las categorías de novedades</p>
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Lista de categorías */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No hay categorías creadas</p>
              <button
                onClick={handleCreate}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Crear primera categoría
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nombre</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fecha de creación</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ej: Promociones"
                  maxLength={100}
                  autoFocus
                />
              </div>
              
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ¿Eliminar categoría?
              </h2>
              <p className="text-gray-600 mb-6">
                Vas a eliminar la categoría <strong>"{categoryToDelete?.name}"</strong>. 
                Las novedades asociadas quedarán sin categoría.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}