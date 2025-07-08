/**
 * Estado global del dashboard de administración
 *
 * FUNCIONALIDADES:
 * - Centraliza y sincroniza la información compartida entre módulos del dashboard
 * - Manejo de listas: productos, administradores y ventas
 * - Control de sesión: usuario logueado y sección activa
 * - Funciones getter y setter para acceder y modificar el estado
 */

export const DashboardState = {
  // ========== DATOS DEL ESTADO ==========

  // Variables de productos
  todosLosProductos: [], // Lista completa de productos del servidor
  productosFiltrados: [], // Productos después de aplicar filtros de búsqueda

  // Variables de administradores y ventas
  administradores: [], // Lista de administradores del sistema
  ventas: [], // Historial de ventas realizadas

  // Usuario y navegación
  usuarioActual: null, // Información del admin que está logueado
  seccionActiva: 'productos', // Qué sección del dashboard se está mostrando

  // ========== GETTERS (Para obtener datos) ==========

  /**
   * Obtiene la lista completa de productos
   * @returns {Array} Array de productos
   */
  getProductos: () => DashboardState.todosLosProductos,

  /**
   * Obtiene los productos filtrados por búsqueda
   * @returns {Array} Array de productos filtrados
   */
  getProductosFiltrados: () => DashboardState.productosFiltrados,

  /**
   * Obtiene la lista de administradores
   * @returns {Array} Array de administradores
   */
  getAdministradores: () => DashboardState.administradores,

  /**
   * Obtiene el historial de ventas
   * @returns {Array} Array de ventas
   */
  getVentas: () => DashboardState.ventas,

  /**
   * Obtiene información del usuario actual
   * @returns {Object|null} Datos del usuario logueado
   */
  getUsuarioActual: () => DashboardState.usuarioActual,

  /**
   * Obtiene la sección activa del dashboard
   * @returns {string} Nombre de la sección activa
   */
  getSeccionActiva: () => DashboardState.seccionActiva,

  // ========== SETTERS (Para modificar datos) ==========

  /**
   * Establece la lista completa de productos
   * @param {Array} productos - Array de productos del servidor
   */
  setProductos: (productos) => {
    DashboardState.todosLosProductos = productos
  },

  /**
   * Establece los productos filtrados para mostrar
   * @param {Array} productos - Array de productos después del filtro
   */
  setProductosFiltrados: (productos) => {
    DashboardState.productosFiltrados = productos
  },

  /**
   * Establece la lista de administradores
   * @param {Array} admins - Array de administradores del sistema
   */
  setAdministradores: (admins) => {
    DashboardState.administradores = admins
  },

  /**
   * Establece el historial de ventas
   * @param {Array} ventas - Array de ventas realizadas
   */
  setVentas: (ventas) => {
    DashboardState.ventas = ventas
  },

  /**
   * Establece el usuario actualmente logueado
   * @param {Object|null} usuario - Datos del usuario o null si no hay sesión
   */
  setUsuarioActual: (usuario) => {
    DashboardState.usuarioActual = usuario
  },

  /**
   * Cambia la sección activa del dashboard
   * @param {string} seccion - Nombre de la sección ('productos', 'ventas', 'administradores')
   */
  setSeccionActiva: (seccion) => {
    DashboardState.seccionActiva = seccion
  },

  // ========== UTILIDADES ==========

  /**
   * Reinicia todo el estado a sus valores iniciales
   * Útil para limpiar datos al cerrar sesión o cambiar de usuario
   */
  reset: () => {
    DashboardState.todosLosProductos = []
    DashboardState.productosFiltrados = []
    DashboardState.administradores = []
    DashboardState.ventas = []
    DashboardState.usuarioActual = null
    DashboardState.seccionActiva = 'productos'
  }
}
