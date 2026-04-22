// src/pages/st/Compras.jsx
import { useState } from 'react';
import CatalogTab from './compras/CatalogTab';
import OrdersTab from './compras/OrdersTab';
import CartDrawer from './compras/CartDrawer';
import { CartProvider } from '../../contexts/CartContext';

export default function Compras() {
  const [activeTab, setActiveTab] = useState('catalogo');

  return (
    <CartProvider>
      <div className="min-h-screen pb-20">
        {/* Header con tabs */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'catalogo'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'pedidos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Mis Pedidos
            </button>
          </div>
        </div>

        {/* Contenido de tabs */}
        <div className="p-4">
          {activeTab === 'catalogo' && <CatalogTab />}
          {activeTab === 'pedidos' && <OrdersTab />}
        </div>

        {/* Drawer del carrito */}
        <CartDrawer />
      </div>
    </CartProvider>
  );
}