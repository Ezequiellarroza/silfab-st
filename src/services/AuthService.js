// src/services/AuthService.js

const LS_TOKEN = "silfab_token";
const LS_USER = "silfab_user";
const API_URL = "https://trinity.com.ar/silfab-api";

/**
 * Realiza el login del usuario contra la API
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {boolean} remember - Si debe recordar la sesión
 * @returns {Promise<Object>} Datos del usuario y token
 */
export async function login({ email, password, remember = true }) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Error en el login');
    }

    if (!data.success) {
      throw new Error(data.error || data.message || 'Credenciales inválidas');
    }

    const { token, user } = data.data;

    // Guardamos sesión
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(LS_TOKEN, token);
    storage.setItem(LS_USER, JSON.stringify(user));

    return { user, token };

  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Obtiene el token almacenado
 * @returns {string|null} Token de autenticación
 */
export function getToken() {
  return (
    localStorage.getItem(LS_TOKEN) || sessionStorage.getItem(LS_TOKEN) || null
  );
}

/**
 * Obtiene los datos del usuario actual
 * @returns {Object|null} Datos del usuario
 */
export function getCurrentUser() {
  const raw =
    localStorage.getItem(LS_USER) || sessionStorage.getItem(LS_USER);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} True si hay sesión activa
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
  [localStorage, sessionStorage].forEach(store => {
    store.removeItem(LS_TOKEN);
    store.removeItem(LS_USER);
    store.removeItem("silfab_login_email"); // por si queda recordado
  });
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} role - Rol a verificar
 * @returns {boolean} True si el usuario tiene ese rol
 */
export function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

/**
 * Verifica si el usuario es admin
 * @returns {boolean} True si es admin
 */
export function isAdmin() {
  return hasRole('admin');
}

/**
 * Verifica si el usuario es servicio técnico
 * @returns {boolean} True si es servicio técnico
 */
export function isServicioTecnico() {
  return hasRole('servicio_tecnico');
}

/**
 * Obtiene el header de autorización para las peticiones
 * @returns {Object} Headers con el token
 */
export function getAuthHeader() {
  const token = getToken();
  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`
  };
}