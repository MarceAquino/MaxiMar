/**
 * MÓDULO: Controlador de Modales
 *
 * FUNCIONALIDADES:
 * - Reemplaza el método nativo confirm() por modales personalizados y estilizados.
 * - Permite mostrar diálogos de confirmación con título, mensaje, icono y botones configurables.
 * - Soporta confirmación por click en botones o por tecla Escape.
 * - Maneja animaciones de entrada y salida del modal.
 *
 * DEPENDENCIAS:
 * - Manipulación directa del DOM para crear, mostrar y eliminar modales.
 * - Uso de eventos para interacción y accesibilidad (teclado y mouse).
 */
let modalActual = null

/**
 * Muestra una confirmación modal personalizada
 * @param {Object} opciones - Configuración del modal
 * @returns {Promise<boolean>} - true si confirma, false si cancela
 */
async function mostrarConfirmacion (opciones = {}) {
  return new Promise((resolve) => {
    const config = {
      titulo: 'Confirmación',
      mensaje: '¿Estás seguro?',
      icono: '❓',
      botonConfirmar: 'Sí',
      botonCancelar: 'No',
      tipoConfirmar: 'primario',
      tipoCancelar: 'secundario',
      ...opciones
    }
    mostrarModal(config, resolve)
  })
}

/**
 * Crea y muestra el modal en el DOM
 * @param {Object} config - Configuración del modal
 * @param {Function} resolve - Función para resolver la promesa
 */
function mostrarModal (config, resolve) {
  // Cerrar modal existente si hay uno
  if (modalActual) cerrarModal()

  // Crear elemento modal
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'

  // Formatear el mensaje para mostrar saltos de línea
  const mensajeFormateado = config.mensaje.replace(/\n/g, '<br>')

  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-icon">${config.icono}</span>
        <h3>${config.titulo}</h3>
        <div class="modal-mensaje">${mensajeFormateado}</div>
      </div>
      <div class="modal-footer">
        <button class="modal-boton ${config.tipoConfirmar}" data-accion="confirmar">
          ${config.botonConfirmar}
        </button>
        <button class="modal-boton ${config.tipoCancelar}" data-accion="cancelar">
          ${config.botonCancelar}
        </button>
      </div>
    </div>
  `

  // Agregar al DOM y configurar eventos
  document.body.appendChild(overlay)
  modalActual = overlay

  // Animación de entrada
  setTimeout(() => overlay.classList.add('mostrar'), 10)

  // Configurar eventos
  const handleClick = (e) => {
    const accion = e.target.dataset.accion
    if (accion) resolverModal(accion === 'confirmar', resolve)
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      resolverModal(false, resolve)
    }
  }

  overlay.addEventListener('click', handleClick)
  document.addEventListener('keydown', handleKeydown)

  // Guardar referencia al evento para poder removerlo después
  overlay._handleKeydown = handleKeydown
}

/**
 * Cierra el modal y resuelve la promesa
 * @param {boolean} resultado - Valor a resolver
 * @param {Function} resolve - Función resolve de la promesa
 */
function resolverModal (resultado, resolve) {
  if (!modalActual) return

  // Remover eventos
  document.removeEventListener('keydown', modalActual._handleKeydown)

  // Animación de salida
  modalActual.classList.remove('mostrar')

  // Eliminar después de la animación
  setTimeout(() => {
    modalActual.remove()
    modalActual = null
    resolve(resultado)
  }, 300)
}

/**
 * Cierra el modal actual.
 */
function cerrarModal () {
  if (modalActual) {
    document.removeEventListener('keydown', modalActual._handleKeydown)
    modalActual.remove()
    modalActual = null
  }
}

export { mostrarConfirmacion }
