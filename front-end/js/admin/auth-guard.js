/**
 * Archivo para manejar la autenticación y protección de rutas del dashboard de administración.
 *
 * FUNCIONALIDADES:
 * - Maneja el cierre de sesión (logout)
 * - Proporciona funciones para requerir autenticación
 *
 * DEPENDENCIAS:
 * - API_ROUTES para endpoints de autenticación
 * - tokenUtils para manejo de tokens
 */

import { API_ROUTES, tokenUtils } from '../config/api.js'

/**
 * Redirige al usuario a la página de login
 * @private
 */
function redirectToLogin () {
  if (window.location.pathname !== '/front-end/html/admin/loginAdmin.html') {
    window.location.replace('/front-end/html/admin/loginAdmin.html')
  }
}

/**
 * Verifica si el usuario está autenticado y el token es válido
 *
 * @returns {Promise<Object|boolean>} Datos del administrador si está autenticado, false si no
 * @throws {Error} Si hay problemas de conexión con el servidor
 */
export const requireAuth = async () => {
  if (!tokenUtils.hasToken()) {
    redirectToLogin()
    return false
  }

  try {
    const response = await fetch(API_ROUTES.auth.verify, {
      headers: tokenUtils.getAuthHeaders()
    })

    if (!response.ok) {
      tokenUtils.removeToken()
      redirectToLogin()
      return false
    }

    const data = await response.json()
    if (data.admin && data.admin.id) {
      return data.admin
    } else {
      tokenUtils.removeToken()
      redirectToLogin()
      return false
    }
  } catch (error) {
    tokenUtils.removeToken()
    redirectToLogin()
    return false
  }
}
