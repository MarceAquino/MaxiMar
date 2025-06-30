import { API_ROUTES, tokenUtils } from '../config/api.js'
import { clearAllData } from './utils/clearAllData.js'
import { redirectToLogin } from './utils/redirectToLogin.js'

// Verifica si el usuario está autenticado y el token es válido
export const requireAuth = async () => {
  console.log('🔐 Verificando autenticación...')

  // 1. ¿Hay token guardado?
  if (!tokenUtils.hasToken()) {
    console.log('❌ No hay token - Redirigiendo al login')
    redirectToLogin()
    return false
  }

  try {
    // 2. Verificar si el token es válido en el servidor
    const response = await fetch(API_ROUTES.auth.verify, {
      headers: tokenUtils.getAuthHeaders()
    })

    if (!response.ok) {
      console.log('❌ Token inválido - Limpiando y redirigiendo')
      clearAllData()
      redirectToLogin()
      return false
    }

    // 3. Si todo está bien, devolver datos del admin
    const data = await response.json()
    if (data.admin && data.admin.id) {
      console.log('✅ Usuario autenticado:', data.admin.nombre)
      return data.admin
    } else {
      console.log('❌ Respuesta inválida del servidor')
      clearAllData()
      redirectToLogin()
      return false
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    clearAllData()
    redirectToLogin()
    return false
  }
}

// Cierra sesión limpiando datos y redirigiendo
export const logout = async () => {
  // 1. Confirmar que el usuario quiere salir
  if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    return
  }

  console.log('🚪 Cerrando sesión...')

  try {
    // 2. Avisar al servidor que cerramos sesión (opcional)
    if (tokenUtils.hasToken()) {
      await fetch(API_ROUTES.auth.logout, {
        method: 'POST',
        headers: tokenUtils.getAuthHeaders()
      })
    }
  } catch (error) {
    console.log('⚠️ Error al comunicar logout al servidor:', error)
    // No importa si falla, seguimos con el logout local
  }

  // 3. Limpiar todo y redirigir
  clearAllData()
  window.location.replace('/front-end/html/admin/login.html')
}
