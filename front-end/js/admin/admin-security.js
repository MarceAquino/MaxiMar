import { logout, requireAuth } from './auth-guard.js'

window.procesoSubmitActivo = false

// Función para evitar problemas con el caché del navegador
function configurarProteccionCache () {
  // Detectar cuando la página se carga desde el caché del navegador
  window.addEventListener('pageshow', async (event) => {
    if (event.persisted && !window.procesoSubmitActivo) {
      // La página fue cargada desde caché (botón "atrás")
      // Solo verificar si no estamos en proceso de submit
      console.log('🔄 Página cargada desde caché - Verificando autenticación...')

      const admin = await requireAuth()
      if (!admin) {
        console.log('❌ Sesión inválida desde caché - Redirigiendo')
        window.location.replace('/front-end/html/admin/login.html')
      }
    } else if (event.persisted && window.procesoSubmitActivo) {
      console.log('🛑 Verificación de caché omitida - Proceso de submit activo')
    }
  })
}

// Función para verificar autenticación periódicamente
function configurarVerificacionPeriodica () {
  // Verificar cada 5 minutos si la sesión sigue siendo válida
  // Solo si no estamos en proceso de submit
  setInterval(async () => {
    if (!window.procesoSubmitActivo) {
      const admin = await requireAuth()
      if (!admin) {
        console.log('❌ Sesión expirada en verificación periódica')
        await logout()
      }
    } else {
      console.log('🛑 Verificación periódica omitida - Proceso de submit activo')
    }
  }, 5 * 60 * 1000) // 5 minutos
}

// Función para configurar headers que eviten el caché
function configurarHeadersNoCache () {
  // Agregar meta tags para evitar caché
  const metaCache = document.createElement('meta')
  metaCache.httpEquiv = 'Cache-Control'
  metaCache.content = 'no-cache, no-store, must-revalidate'
  document.head.appendChild(metaCache)

  const metaPragma = document.createElement('meta')
  metaPragma.httpEquiv = 'Pragma'
  metaPragma.content = 'no-cache'
  document.head.appendChild(metaPragma)

  const metaExpires = document.createElement('meta')
  metaExpires.httpEquiv = 'Expires'
  metaExpires.content = '0'
  document.head.appendChild(metaExpires)
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🛡️ Configurando protecciones de seguridad...')

  // Configurar todas las protecciones
  configurarProteccionCache()
  configurarVerificacionPeriodica()
  configurarHeadersNoCache()

  console.log('✅ Protecciones de seguridad configuradas')
})
