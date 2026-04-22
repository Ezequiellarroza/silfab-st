// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showNotification } = useNotification();
  
  // ✅ NUEVO: Control de debounce para evitar toasts duplicados
  const addingToCartRef = useRef(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('silfab_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        localStorage.removeItem('silfab_cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('silfab_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Agregar item al carrito
   * Valida stock y cantidad máxima antes de agregar
   * ✅ ACTUALIZADO: Ahora incluye debounce para prevenir duplicados
   */
  const addToCart = (part, product) => {
    // ✅ Prevenir múltiples llamadas simultáneas
    if (addingToCartRef.current) {
      return;
    }
    
    addingToCartRef.current = true;
    
    // ✅ Liberar el lock después de 500ms
    setTimeout(() => {
      addingToCartRef.current = false;
    }, 500);

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.part_id === part.id);
      
      if (existingIndex >= 0) {
        // Si ya existe, incrementar cantidad
        const updated = [...prev];
        const newQuantity = updated[existingIndex].cantidad + 1;
        
        // Validar stock y max_cantidad
        if (newQuantity > part.stock) {
          showNotification({
            type: 'warning',
            message: `Stock insuficiente. Disponible: ${part.stock} unidades`
          });
          return prev;
        }
        if (newQuantity > part.max_cantidad) {
          showNotification({
            type: 'warning',
            message: `Cantidad máxima permitida: ${part.max_cantidad} unidades`
          });
          return prev;
        }
        
        updated[existingIndex].cantidad = newQuantity;
        updated[existingIndex].subtotal = newQuantity * part.precio;
        
        showNotification({
          type: 'success',
          message: 'Cantidad actualizada en el carrito'
        });
        
        return updated;
      } else {
        // Si no existe, agregar nuevo
        if (part.stock < 1) {
          showNotification({
            type: 'error',
            message: 'Sin stock disponible'
          });
          return prev;
        }
        
        showNotification({
          type: 'success',
          message: 'Producto agregado al carrito'
        });
        
        return [...prev, {
          part_id: part.id,
          codigo: part.codigo,
          descripcion: part.descripcion,
          imagen: part.imagen,
          precio_unitario: part.precio,
          cantidad: 1,
          subtotal: part.precio,
          stock_disponible: part.stock,
          max_cantidad: part.max_cantidad,
          product_name: product.nombre,
          product_sku: product.sku
        }];
      }
    });
  };

  /**
   * Actualizar cantidad de un item en el carrito
   * Valida límites de stock y cantidad máxima
   */
  const updateQuantity = (partId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(partId);
      return;
    }

    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.part_id === partId) {
          // Validar límites
          if (newQuantity > item.stock_disponible) {
            showNotification({
              type: 'warning',
              message: `Stock insuficiente. Disponible: ${item.stock_disponible} unidades`
            });
            return item;
          }
          if (newQuantity > item.max_cantidad) {
            showNotification({
              type: 'warning',
              message: `Cantidad máxima permitida: ${item.max_cantidad} unidades`
            });
            return item;
          }
          
          return {
            ...item,
            cantidad: newQuantity,
            subtotal: newQuantity * item.precio_unitario
          };
        }
        return item;
      });
      return updated;
    });
  };

  /**
   * Remover item del carrito
   */
  const removeFromCart = (partId) => {
    setCartItems(prev => prev.filter(item => item.part_id !== partId));
    showNotification({
      type: 'info',
      message: 'Producto eliminado del carrito'
    });
  };

  /**
   * Limpiar todo el carrito
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('silfab_cart');
  };

  /**
   * Calcular totales del carrito
   */
  const getTotals = () => {
    const total_items = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
    const total_amount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    return { total_items, total_amount };
  };

  // Funciones para abrir/cerrar el drawer del carrito
  const toggleCart = () => setIsCartOpen(prev => !prev);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotals,
    toggleCart,
    openCart,
    closeCart,
    itemCount: cartItems.length
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};