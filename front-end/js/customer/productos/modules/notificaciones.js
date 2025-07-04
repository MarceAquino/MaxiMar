/**
 * MÓDULO: Sistema de Notificaciones
 *
 * Maneja la visualización de mensajes y alertas al usuario.
 *
 * FUNCIONALIDADES:
 * - Mostrar mensajes de información, éxito, advertencia y error
 * - Crear alertas con Bootstrap
 * - Mostrar feedback al agregar productos al carrito
 * - Soporte para sistema de alertas personalizado
 *
 * TIPOS DE MENSAJE:
 * - 'info': Información general (azul)
 * - 'success': Operación exitosa (verde)
 * - 'warning': Advertencia (amarillo)
 * - 'danger': Error (rojo)
 */

/**
 * Muestra un mensaje al usuario usando alertas Bootstrap
 * @param {string} mensaje - Texto del mensaje a mostrar
 * @param {string} tipo - Tipo de alerta ('info', 'success', 'warning', 'danger')
 */
export function mostrarMensaje (mensaje, tipo = 'info') {
  // Usar las nuevas alertas personalizadas si están disponibles
  if (window.customAlert) {
    return window.customAlert.show(mensaje, tipo, { duration: 4000 })
  }

  crearAlertaBootstrap(mensaje, tipo)
}

/**
 * Crea y muestra una alerta usando Bootstrap
 * @param {string} mensaje - Texto del mensaje
 * @param {string} tipo - Tipo de alerta Bootstrap
 */
function crearAlertaBootstrap (mensaje, tipo) {
  const alerta = document.createElement('div')
  alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`
  alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  alerta.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    `

  document.body.appendChild(alerta)

  // Auto-eliminar después de 3 segundos
  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.remove()
    }
  }, 3000)
}

/**
 * Muestra un toast de confirmación al agregar producto al carrito
 * Aparece brevemente en pantalla con ícono de éxito
 */
export function mostrarFeedbackAgregar () {
  const toast = document.createElement('div')
  toast.className = 'toast-feedback'
  toast.innerHTML = '<i class="fas fa-check-circle me-2"></i> Producto agregado al carrito'
  document.body.appendChild(toast)

  // Auto-eliminar después de 2 segundos
  setTimeout(() => {
    toast.remove()
  }, 2000)
}
