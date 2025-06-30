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

// Evita que el navegador guarde caché de la página de admin/superadmin
function evitarCacheAdmin () {
  [
    { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
    { httpEquiv: 'Pragma', content: 'no-cache' },
    { httpEquiv: 'Expires', content: '0' }
  ].forEach(metaInfo => {
    const meta = document.createElement('meta')
    meta.httpEquiv = metaInfo.httpEquiv
    meta.content = metaInfo.content
    document.head.appendChild(meta)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🛡️ Configurando protecciones de seguridad...')

  // Configurar todas las protecciones
  configurarProteccionCache()
  configurarVerificacionPeriodica()
  evitarCacheAdmin()

  console.log('✅ Protecciones de seguridad configuradas')
})
