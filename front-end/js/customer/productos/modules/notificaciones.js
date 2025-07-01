// Función principal para mostrar mensajes
export function mostrarMensaje (mensaje, tipo = 'info') {
  console.log(`Mostrando mensaje: ${mensaje} (${tipo})`)

  // Usar las nuevas alertas personalizadas si están disponibles
  if (window.customAlert) {
    return window.customAlert.show(mensaje, tipo, { duration: 4000 })
  }

  crearAlertaBootstrap(mensaje, tipo)
}

// Función para crear alerta con Bootstrap
function crearAlertaBootstrap (mensaje, tipo) {
  const alerta = document.createElement('div')
  alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`
  alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  alerta.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    `

  document.body.appendChild(alerta)

  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.remove()
    }
  }, 3000)
}

// Función para mostrar feedback al agregar producto
export function mostrarFeedbackAgregar () {
  const toast = document.createElement('div')
  toast.className = 'toast-feedback'
  toast.innerHTML = '<i class="fas fa-check-circle me-2"></i> Producto agregado al carrito'
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 2000)
}
