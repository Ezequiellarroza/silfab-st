// src/pages/st/compras/CartDrawer.jsx
import { useState } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { OrderAPI, handleApiError } from '../../../services/ApiService';
import Modal from '../../../components/ui/Modal';

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getTotals 
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState(null);
  
  // Estados para modales
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  });

  const { total_items, total_amount } = getTotals();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Carrito vacío',
        message: 'No hay items en el carrito para procesar.',
        onConfirm: null
      });
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Preparar datos del pedido
      const orderData = {
        order_items: cartItems.map(item => ({
          part_id: item.part_id,
          cantidad: item.cantidad
        })),
        shipping_address: shippingAddress.trim() || null,
        notes: notes.trim() || null
      };

      const response = await OrderAPI.createOrder(orderData);

      if (response.success) {
        setModal({
          isOpen: true,
          type: 'success',
          title: '¡Pedido creado!',
          message: `Tu pedido ha sido creado exitosamente.\n\nNúmero de orden: ${response.data.order_number}\nTotal: $${response.data.total_amount.toFixed(2)}`,
          onConfirm: () => {
            clearCart();
            setShippingAddress('');
            setNotes('');
            closeCart();
          }
        });
      } else {
        setCheckoutError(response.error || 'Error al crear el pedido');
      }
    } catch (error) {
      setCheckoutError(handleApiError(error));
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Carrito ({total_items} {total_items === 1 ? 'item' : 'items'})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {/* Lista de items */}
              {cartItems.map(item => (
                <div key={item.part_id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.descripcion}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.product_name} • {item.codigo}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.part_id)}
                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Cantidad */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.part_id, item.cantidad - 1)}
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.part_id, item.cantidad + 1)}
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">
                        ${item.subtotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${item.precio_unitario.toFixed(2)} c/u
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Dirección y notas */}
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de envío (opcional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Calle, número, ciudad..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones especiales..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>

              {/* Error de checkout */}
              {checkoutError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {checkoutError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">${total_amount.toFixed(2)}</span>
            </div>

            {/* Botones */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingOut ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
              
              <button
                onClick={clearCart}
                disabled={isCheckingOut}
                className="w-full py-2 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmaciones */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
      />
    </>
  );
}