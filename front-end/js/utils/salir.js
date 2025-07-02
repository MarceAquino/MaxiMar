// Variable global para tokenUtils
let tokenUtils = null

// Función para cargar tokenUtils de forma asíncrona
async function cargarTokenUtils () {
  try {
    // Esto solo funcionará si estamos en contexto de módulo
    const apiModule = await import('../config/api.js')
    tokenUtils = apiModule.tokenUtils
    return true
  } catch (error) {
    // Si falla el import, estamos en páginas de cliente (sin módulos)
    return false
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Intentar cargar tokenUtils si estamos en una página de admin
  const esPageinaAdmin = window.location.pathname.includes('/admin/')
  if (esPageinaAdmin) {
    await cargarTokenUtils()
  }

  // Buscar el botón de logout
  const botonSalir = document.getElementById('logoutBtn')

  // Si existe el botón, configurar su evento
  if (botonSalir) {
    botonSalir.addEventListener('click', manejarSalida)
  } else {
    console.warn('No se encontró botón de logout')
  }
})

function manejarSalida (evento) {
  evento.preventDefault()

  const confirmar = confirm('¿Estás seguro que quieres salir?')

  if (confirmar) {
    // Verificar si estamos en una página de admin
    const esPageinaAdmin = window.location.pathname.includes('/admin/')

    if (esPageinaAdmin && tokenUtils) {
      // Para admin: limpiar token JWT usando tokenUtils y sessionStorage
      tokenUtils.removeToken()
      sessionStorage.clear() // Limpiar todo el sessionStorage
      window.location.href = '/front-end/html/admin/login.html'
    } else if (esPageinaAdmin) {
      // Fallback para admin sin tokenUtils
      sessionStorage.clear()
      localStorage.clear() // Por si acaso había datos antiguos
      window.location.href = '/front-end/html/admin/login.html'
    } else {
      // Para cliente: limpiar sessionStorage del carrito y datos de cliente
      sessionStorage.clear() // El carrito ahora se guarda en sessionStorage
      localStorage.clear() // Limpiar localStorage por si había datos antiguos

      // Si es cliente, usar el href del botón o ir al inicio
      const destino = evento.currentTarget.href || '/front-end/index.html'
      window.location.href = destino
    }
  }
}
