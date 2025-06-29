export const DashboardState = {
  // Variables de productos
  todosLosProductos: [],
  productosFiltrados: [],

  // Variables de administradores y ventas
  administradores: [],
  ventas: [],

  // Usuario y navegación
  usuarioActual: null,
  seccionActiva: 'productos',

  // Getters
  getProductos: () => DashboardState.todosLosProductos,
  getProductosFiltrados: () => DashboardState.productosFiltrados,
  getAdministradores: () => DashboardState.administradores,
  getVentas: () => DashboardState.ventas,
  getUsuarioActual: () => DashboardState.usuarioActual,
  getSeccionActiva: () => DashboardState.seccionActiva,

  // Setters
  setProductos: (productos) => {
    DashboardState.todosLosProductos = productos
  },

  setProductosFiltrados: (productos) => {
    DashboardState.productosFiltrados = productos
  },

  setAdministradores: (admins) => {
    DashboardState.administradores = admins
  },

  setVentas: (ventas) => {
    DashboardState.ventas = ventas
  },

  setUsuarioActual: (usuario) => {
    DashboardState.usuarioActual = usuario
  },

  setSeccionActiva: (seccion) => {
    DashboardState.seccionActiva = seccion
  },

  // Utilidades
  reset: () => {
    DashboardState.todosLosProductos = []
    DashboardState.productosFiltrados = []
    DashboardState.administradores = []
    DashboardState.ventas = []
    DashboardState.usuarioActual = null
    DashboardState.seccionActiva = 'productos'
  }
}
