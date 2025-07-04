/**
 * SISTEMA DE AUTENTICACIÓN DE CLIENTE
 *
 * Funcionalidad:
 * - Verifica que el usuario haya ingresado un nombre válido
 * - Redirige automáticamente al inicio si no hay nombre guardado
 * - Protege todas las páginas del área de cliente
 *
 * Uso:
 * - Incluir este script en todas las páginas de customer
 * - Se ejecuta automáticamente al cargar la página
 */

/**
 * Verifica si el usuario tiene un nombre válido guardado
 * @returns {boolean} true si tiene nombre válido, false si no
 */
function tieneNombreValido () {
  const nombreGuardado = localStorage.getItem('nombreUsuario')

  // Verificar que existe, no esté vacío y tenga al menos 3 caracteres
  return nombreGuardado &&
         nombreGuardado.trim().length >= 3
}

/**
 * Redirige al usuario a la página de inicio
 * Con un pequeño delay para evitar loops de redirección
 */
function redirigirAInicio () {
  // Verificar que no estemos ya en la página de inicio
  const esPaginaInicio = window.location.pathname.endsWith('/index.html') ||
                        window.location.pathname === '/front-end/' ||
                        window.location.pathname === '/front-end/index.html' ||
                        window.location.pathname === '/'

  if (!esPaginaInicio) {
    // Evitar loops de redirección
    if (sessionStorage.getItem('redirigiendo') === 'true') {
      return
    }

    sessionStorage.setItem('redirigiendo', 'true')

    // Mostrar mensaje opcional (se puede comentar si no se desea)
    console.log('Redirigiendo a inicio: nombre de usuario requerido')

    // Pequeño delay para evitar problemas de timing
    setTimeout(() => {
      window.location.href = '/front-end/index.html'
    }, 100)
  }
}

/**
 * Verifica la autenticación del cliente
 * Se ejecuta automáticamente al cargar el script
 */
function verificarAutenticacionCliente () {
  // Solo ejecutar en páginas de customer
  const esPaginaCustomer = window.location.pathname.includes('/customer/')

  if (esPaginaCustomer) {
    if (!tieneNombreValido()) {
      redirigirAInicio()
      return false
    }

    // Si llegamos aquí, el usuario está autenticado correctamente
    return true
  }

  // Si no es página de customer, no hacer nada
  return true
}

/**
 * Obtiene el nombre del usuario actual
 * @returns {string|null} El nombre del usuario o null si no existe
 */
function obtenerNombreUsuario () {
  return localStorage.getItem('nombreUsuario')
}

/**
 * Limpia la sesión del usuario (para logout)
 */
function limpiarSesionCliente () {
  localStorage.removeItem('nombreUsuario')
  // También limpiar carrito si existe
  localStorage.removeItem('carrito')
}

// EJECUCIÓN AUTOMÁTICA
// =====================
// Se ejecuta inmediatamente cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacionCliente()
})

// También verificar si se accede directamente a la URL sin DOMContentLoaded
if (document.readyState === 'loading') {
  // El DOM aún se está cargando, esperar al evento DOMContentLoaded
  document.addEventListener('DOMContentLoaded', verificarAutenticacionCliente)
} else {
  // El DOM ya se cargó, ejecutar inmediatamente
  verificarAutenticacionCliente()
}

// EXPORTAR FUNCIONES PARA USO EXTERNO
// ====================================
window.customerAuth = {
  tieneNombreValido,
  obtenerNombreUsuario,
  limpiarSesionCliente,
  verificarAutenticacionCliente
}
