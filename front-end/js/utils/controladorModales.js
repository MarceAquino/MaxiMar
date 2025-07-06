/**
 * MÓDULO: Controlador de Modales
 *
 * Sistema de confirmación personalizado para Maximar Petshop
 * Reemplaza confirm() nativo con modales estilizados
 *
 * USO:
 * const confirmado = await mostrarConfirmacion({
 *   titulo: 'Confirmar',
 *   mensaje: '¿Deseas continuar?'
 * })
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
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-icon">${config.icono}</span>
        <h3>${config.titulo}</h3>
        <p>${config.mensaje}</p>
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

  overlay.addEventListener('click', handleClick)
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
 * Cierra el modal actual (para uso externo si es necesario)
 */
function cerrarModal () {
  if (modalActual) {
    document.removeEventListener('keydown', modalActual._handleKeydown)
    modalActual.remove()
    modalActual = null
  }
}

/**
 * Confirmación específica para vaciar carrito.
 * @returns {Promise<boolean>} - true si confirma vaciar
 */
async function vaciarCarritoModal () {
  return await mostrarConfirmacion({
    titulo: 'Vaciar carrito',
    mensaje: '¿Estás seguro de que quieres vaciar todo el carrito?',
    botonConfirmar: 'Vaciar',
    botonCancelar: 'Cancelar',
    tipoConfirmar: 'peligro'
  })
}
/**
 * Confirmación específica para crear un producto nuevo.
 * @returns {Promise<boolean>} - true si confirma crear
 */
async function crearProductoModal () {
  return await mostrarConfirmacion({
    titulo: 'crear Producto',
    mensaje: '¿Estás seguro que desea crear el producto?',
    botonConfirmar: 'Confirmar',
    botonCancelar: 'Cancelar',
    tipoConfirmar: 'confirmar'
  })
}

/**
 * Confirmación específica para salir.
 * @returns {Promise<boolean>} - true si confirma salir
 */
async function salirModal () {
  return await mostrarConfirmacion({
    titulo: 'salir',
    mensaje: '¿Estás seguro que desea salir?',
    botonConfirmar: 'Salir',
    botonCancelar: 'Cancelar',
    tipoConfirmar: 'peligro'
  })
}

/**
 * Confirmación específica para salir.
 * @returns {Promise<boolean>} - true si confirma salir
 */
async function modificarProductoModal () {
  return await mostrarConfirmacion({
    titulo: 'modificar producto',
    mensaje: '¿Estás seguro que desea modificar el producto?',
    botonConfirmar: 'Confirmar',
    botonCancelar: 'Cancelar',
    tipoConfirmar: 'confirmar'
  })
}

export { salirModal, crearProductoModal, modificarProductoModal, vaciarCarritoModal }
