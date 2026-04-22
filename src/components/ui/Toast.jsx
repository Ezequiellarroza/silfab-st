// src/components/ui/Toast.jsx
import { useEffect, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * Componente Toast Container
 * Muestra todas las notificaciones activas en la parte superior de la pantalla
 */
export default function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

/**
 * Componente Toast individual
 */
function Toast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Animación de entrada
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  // Estilos según el tipo
  const styles = {
    success: {
      bg: 'bg-green-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const style = styles[notification.type] || styles.info;

  return (
    <div
      className={`
        ${style.bg} text-white rounded-lg shadow-lg px-4 py-3 
        flex items-center gap-3 max-w-md w-full
        transform transition-all duration-300 pointer-events-auto
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
      `}
    >
      {/* Icono */}
      <div className="flex-shrink-0">
        {style.icon}
      </div>

      {/* Mensaje */}
      <p className="flex-1 text-sm font-medium">
        {notification.message}
      </p>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}