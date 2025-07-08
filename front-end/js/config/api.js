/**
 * CONFIGURACIÓN DE LA API - MAXIMAR PET STORE
 *
 * Este archivo contiene toda la configuración para comunicarse con el servidor backend.
 * Incluye:
 * - URL base del servidor
 * - Todas las rutas de la API organizadas por categorías
 * - Utilidades para manejar tokens de autenticación
 *
 * La API actúa como intermediario entre el frontend y el backend,
 * facilitando la comunicación entre la interfaz de usuario y la base de datos.
 */

// URL base donde está corriendo nuestro servidor backend
const API_URL = 'http://localhost:3030/api'

/**
 * RUTAS DE LA API
 * Aquí definimos todas las URLs que usamos para comunicarnos con el servidor.
 * Están organizadas por categorías para que sea más fácil encontrarlas.
 */
const API_ROUTES = {
  // PRODUCTOS - Todo lo relacionado con los productos de la tienda
  productos: `${API_URL}/products`,
  productoPorId: (id) => `${API_URL}/products/${id}`,
  crearProducto: `${API_URL}/products`,
  actualizarProducto: (id) => `${API_URL}/products/${id}`,

  // AUTENTICACIÓN - Para que los administradores puedan iniciar sesión
  auth: {
    login: `${API_URL}/auth/login`, // Iniciar sesión
    verify: `${API_URL}/auth/verify`, // Verificar si el token es válido
    logout: `${API_URL}/auth/logout` // Cerrar sesión
  },

  // REGISTRO - Para crear nuevos administradores
  registrarAdmin: `${API_URL}/auth/register`,

  // ADMINISTRADORES - Gestión de usuarios administradores
  admin: {
    list: `${API_URL}/admin/list`, // Ver todos los admins
    toggle: (id) => `${API_URL}/admin/${id}/toggle` // Activar/desactivar admin
  },

  // VENTAS - Todo lo relacionado con las compras
  ventas: {
    crear: `${API_URL}/sales`, // Crear una nueva venta
    obtener: (id) => `${API_URL}/sales/${id}`, // Obtener una venta específica
    todas: `${API_URL}/sales` // Obtener todas las ventas
  },

  // Endpoint para validar email de admin
  validarEmail: `${API_URL}/auth/validar-email`
}

/**
 * UTILIDADES PARA TOKENS DE AUTENTICACIÓN
 *
 * Un token JWT es un mecanismo seguro de autenticación que permite
 * verificar la identidad del usuario sin necesidad de almacenar credenciales.
 *
 * Se utiliza sessionStorage para almacenamiento temporal del token,
 * que se elimina automáticamente al cerrar la sesión del navegador.
 */

// Clave para el almacenamiento del token en sessionStorage
const TOKEN_KEY = 'maximar_admin_token'

/**
 * UTILIDADES PARA MANEJO DE TOKENS
 * Conjunto de funciones para gestionar el ciclo de vida del token de autenticación
 */
const tokenUtils = {
  /**
   * Almacena el token de autenticación en sessionStorage
   * @param {string} token - Token JWT recibido del servidor
   */
  saveToken: (token) => sessionStorage.setItem(TOKEN_KEY, token),

  /**
   * Recupera el token almacenado
   * @returns {string|null} Token o null si no existe
   */
  getToken: () => sessionStorage.getItem(TOKEN_KEY),

  /**
   * Elimina el token del almacenamiento (logout)
   */
  removeToken: () => sessionStorage.removeItem(TOKEN_KEY),

  /**
   * Verifica la existencia del token
   * @returns {boolean} true si existe un token válido
   */
  hasToken: () => !!sessionStorage.getItem(TOKEN_KEY),

  /**
   * Genera headers de autorización para peticiones HTTP
   * @returns {Object} Headers con Authorization Bearer o objeto vacío
   */
  getAuthHeaders: () => {
    const token = tokenUtils.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  /**
   * Decodifica el payload del token JWT
   * @returns {Object|null} Datos del usuario o null en caso de error
   */
  getDecodedToken: () => {
    const token = tokenUtils.getToken()
    if (!token) return null

    try {
      // Extrae el payload (segunda parte) del token JWT
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload)) // Decodifica de base64
    } catch (error) {
      console.error('Error al decodificar el token:', error)
      return null
    }
  }
}

export { API_ROUTES, API_URL, tokenUtils }
