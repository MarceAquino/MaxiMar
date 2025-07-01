// Ruta base de la api.
const API_URL = 'http://localhost:3030/api'

// Rutas específicas
const API_ROUTES = {
  productos: `${API_URL}/products`,
  productoPorId: (id) => `${API_URL}/products/${id}`,
  crearProducto: `${API_URL}/products`,
  actualizarProducto: (id) => `${API_URL}/products/${id}`,
  // Rutas de autenticación
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    verify: `${API_URL}/auth/verify`,
    logout: `${API_URL}/auth/logout`
  },
  // Ruta para registrar administradores (solo SuperAdmin)
  registrarAdmin: `${API_URL}/auth/register`,
  // Rutas de administradores (solo SuperAdmin)
  admin: {
    list: `${API_URL}/admin/list`,
    toggle: (id) => `${API_URL}/admin/${id}/toggle`,
    delete: (id) => `${API_URL}/admin/${id}`
  }, // Rutas de ventas
  ventas: {
    crear: `${API_URL}/sales`,
    obtener: (id) => `${API_URL}/sales/${id}`,
    todas: `${API_URL}/sales`,
    detalle: (id) => `${API_URL}/sales/${id}`
  }
}

// Utilidades para manejar tokens
const TOKEN_KEY = 'maximar_admin_token'

const tokenUtils = {
  // Guardar token en sessionStorage (se borra al cerrar navegador)
  saveToken: (token) => {
    sessionStorage.setItem(TOKEN_KEY, token)
  },

  // Obtener token de sessionStorage
  getToken: () => {
    return sessionStorage.getItem(TOKEN_KEY)
  },

  // Eliminar token de sessionStorage
  removeToken: () => {
    sessionStorage.removeItem(TOKEN_KEY)
  },

  // Verificar si hay token
  hasToken: () => {
    return !!sessionStorage.getItem(TOKEN_KEY)
  },
  // Obtener headers con autorización
  getAuthHeaders: () => {
    const token = tokenUtils.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  // Decodificar token JWT
  getDecodedToken: () => {
    const token = tokenUtils.getToken()
    if (!token) return null

    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded
    } catch (error) {
      console.error('Error decodificando token:', error)
      return null
    }
  }
}

export { API_ROUTES, API_URL, tokenUtils }
