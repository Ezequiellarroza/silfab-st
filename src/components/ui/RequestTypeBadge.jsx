import React from 'react';

/**
 * Componente RequestTypeBadge
 * 
 * Muestra un badge colorido según el tipo de solicitud
 * Tipos posibles: repuestos, envio
 * 
 * @param {string} type - Tipo de solicitud ('repuestos' o 'envio')
 */
const RequestTypeBadge = ({ type }) => {
  // Configuración de colores, emojis y textos por tipo
  const typeConfig = {
    'repuestos': { 
      color: 'bg-blue-100 text-blue-800', 
      text: 'Repuestos',
      emoji: '📦'
    },
    'envio': { 
      color: 'bg-green-100 text-green-800', 
      text: 'Envío',
      emoji: '🚚'
    }
  };
  
  // Si el tipo no existe en la config, usar 'repuestos' por defecto
  const config = typeConfig[type] || typeConfig['repuestos'];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.emoji} {config.text}
    </span>
  );
};

export default RequestTypeBadge;