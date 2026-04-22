// src/contexts/NotificationContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Muestra una notificación toast
   * @param {Object} options - Configuración de la notificación
   * @param {string} options.type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {string} options.message - Mensaje a mostrar
   * @param {number} options.duration - Duración en ms (default: 3000)
   */
  const showNotification = useCallback(({ type = 'info', message, duration = 3000 }) => {
    const id = Date.now();
    const notification = { id, type, message };

    setNotifications(prev => [...prev, notification]);

    // Auto-remover después de la duración especificada
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  /**
   * Remueve una notificación manualmente
   * @param {number} id - ID de la notificación a remover
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = {
    notifications,
    showNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};