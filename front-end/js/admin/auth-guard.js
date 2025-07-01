/**
 * Guardia de autenticación para proteger rutas del dashboard
 * Verifica tokens y maneja el logout de usuarios
 */

import { API_ROUTES, tokenUtils } from '../config/api.js'
import { redirectToLogin } from './utils/redirectToLogin.js'

/**
 * Verifica si el usuario está autenticado y el token es válido
 * @returns {Object|boolean} Datos del admin si está autenticado, false si no
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

/**
 * Cierra la sesión del usuario
 * Limpia el token y redirige al login
 */
export const logout = async () => {
  if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    return
  }

  try {
    if (tokenUtils.hasToken()) {
      await fetch(API_ROUTES.auth.logout, {
        method: 'POST',
        headers: tokenUtils.getAuthHeaders()
      })
    }
  } catch (error) {
    // Error en logout del servidor, continuamos con logout local
  }

  tokenUtils.removeToken()
  window.location.replace('/front-end/html/admin/login.html')
}
