// Función para limpiar datos de sesión
function limpiarDatos () {
  console.log('🧹 Limpiando datos de sesión...')

  // Limpiar todo el almacenamiento
  sessionStorage.clear()
  localStorage.clear()

  // Si hay tokenUtils disponible (páginas de admin), limpiar token
  try {
    if (window.tokenUtils) {
      window.tokenUtils.removeToken()
    }
  } catch (error) {
    console.log('ℹ️ TokenUtils no disponible')
  }
}

// Función para determinar si estamos en página de admin
function esPageinaAdmin () {
  return window.location.pathname.includes('/admin/')
}

// Configurar sistema de logout
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚪 Configurando sistema de logout...')

  // Configurar botón de logout manual
  const botonSalir = document.getElementById('logoutBtn')
  if (botonSalir) {
    botonSalir.addEventListener('click', manejarSalidaManual)
    console.log('✅ Botón de logout configurado')
  }

  // Configurar limpieza automática al cerrar navegador/pestaña
  window.addEventListener('beforeunload', manejarCierreNavegador)
  console.log('✅ Limpieza automática configurada')
})

// Manejar salida manual (botón de logout)
function manejarSalidaManual (evento) {
  evento.preventDefault()

  const confirmar = confirm('¿Estás seguro que quieres salir?')

  if (confirmar) {
    limpiarDatos()

    // Redirigir según el tipo de usuario
    if (esPageinaAdmin()) {
      window.location.href = '/front-end/html/admin/login.html'
    } else {
      const destino = evento.currentTarget.href || '/front-end/index.html'
      window.location.href = destino
    }
  }
}

// Manejar cierre de navegador/pestaña (limpieza automática)
function manejarCierreNavegador () {
  console.log('🔄 Navegador cerrándose - limpiando datos...')
  limpiarDatos()
}
