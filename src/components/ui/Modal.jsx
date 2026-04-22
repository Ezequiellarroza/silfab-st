import React from 'react';
import Button from './Button';

/**
 * Modal Component
 * 
 * Modal reutilizable para confirmaciones, alertas y mensajes
 * Reemplaza los alert() nativos con una UI más amigable
 * 
 * Props:
 * - isOpen: boolean - Controla si el modal está visible
 * - onClose: function - Función para cerrar el modal
 * - title: string - Título del modal
 * - message: string - Mensaje principal
 * - type: 'success' | 'error' | 'warning' | 'info' - Tipo de modal (afecta colores)
 * - confirmText: string - Texto del botón de confirmación (opcional)
 * - onConfirm: function - Función al confirmar (opcional, si no se pasa solo cierra)
 * - showCancel: boolean - Mostrar botón de cancelar (default: false)
 * - cancelText: string - Texto del botón cancelar
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  onConfirm,
  showCancel = false,
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  // Configuración de colores según tipo
  const typeConfig = {
    success: {
      icon: '✓',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-500',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      icon: '✕',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-500',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: '⚠',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: 'ℹ',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-500',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

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
          className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con ícono */}
          <div className={`flex items-center space-x-3 p-4 border-l-4 ${config.borderColor} ${config.bgColor} rounded-t-lg`}>
            <div className={`text-3xl ${config.textColor}`}>
              {config.icon}
            </div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {title}
            </h3>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-white rounded-md transition-colors ${config.buttonColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;