/**
 * MÓDULO: Controlador de Modales
 *
 * Sistema personalizado de modales para reemplazar alert() y confirm() nativos
 * en Maximar Petshop.
 *
 * FUNCIONALIDADES:
 * - Mostrar alertas personalizadas
 * - Mostrar confirmaciones personalizadas
 * - Métodos predefinidos para casos comunes (salir, cerrar sesión, comprar, etc.)
 * - Manejo de eventos de teclado (Enter, Escape)
 * - Animaciones de entrada y salida
 * - Diseño responsive
 *
 * DEPENDENCIAS:
 * - modales.css (archivo de estilos)
 * - DOM del navegador
 *
 * USO:
 * await mostrarAlerta({ titulo: 'Título', mensaje: 'Mensaje' })
 * const resultado = await mostrarConfirmacion({ titulo: 'Confirmar' })
 */

// Variable global para controlar el modal actual
let modalActual = null

// /**
//  * Muestra una alerta personalizada (reemplaza alert())
//  * @param {Object} opciones - Configuración del modal
//  * @param {string} opciones.titulo - Título del modal
//  * @param {string} opciones.mensaje - Mensaje a mostrar
//  * @param {string} opciones.icono - Emoji o símbolo para el icono
//  * @param {string} opciones.botonTexto - Texto del botón
//  * @param {string} opciones.botonTipo - Tipo de botón (primario, secundario, etc.)
//  * @returns {Promise<boolean>} - Siempre devuelve true cuando se cierra
//  */
// async function mostrarAlerta (opciones = {}) {
//   return new Promise((resolve) => {
//     // Configuración por defecto
//     const config = {
//       tipo: 'alerta',
//       titulo: 'Aviso',
//       mensaje: 'Mensaje de alerta',
//       icono: '⚠️',
//       botonTexto: 'Aceptar',
//       botonTipo: 'primario',
//       ...opciones // Combina opciones por defecto con las del usuario
//     }

//     crearModal(config, resolve)
//   })
// }

/**
 * Muestra una confirmación personalizada (reemplaza confirm())
 * @param {Object} opciones - Configuración del modal
 * @param {string} opciones.titulo - Título del modal
 * @param {string} opciones.mensaje - Mensaje a mostrar
 * @param {string} opciones.icono - Emoji o símbolo para el icono
 * @param {string} opciones.botonConfirmar - Texto del botón de confirmación
 * @param {string} opciones.botonCancelar - Texto del botón de cancelación
 * @returns {Promise<boolean>} - true si confirma, false si cancela
 */
async function mostrarConfirmacion (opciones = {}) {
  return new Promise((resolve) => {
    // Configuración por defecto
    const config = {
      tipo: 'confirmacion',
      titulo: 'Confirmación',
      mensaje: '¿Estás seguro?',
      icono: '❓',
      botonConfirmar: 'Sí',
      botonCancelar: 'No',
      tipoConfirmar: 'primario',
      tipoCancelar: 'secundario',
      ...opciones // Combina opciones por defecto con las del usuario
    }

    crearModal(config, resolve)
  })
}

/**
 * Crea y muestra el modal en el DOM
 * @param {Object} config - Configuración completa del modal
 * @param {Function} resolve - Función para resolver la promesa
 */
function crearModal (config, resolve) {
  // Si ya hay un modal abierto, lo cerramos primero
  if (modalActual) {
    cerrarModal()
  }

  // Crear el elemento overlay (fondo oscuro)
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.innerHTML = generarHTML(config)

  // Agregar al DOM
  document.body.appendChild(overlay)
  modalActual = overlay

  // Configurar eventos (clicks y teclas)
  configurarEventos(overlay, config, resolve)

  // Mostrar modal con animación suave
  setTimeout(() => {
    overlay.classList.add('mostrar')
  }, 10)

  // Enfocar el primer botón para accesibilidad
  setTimeout(() => {
    const primerBoton = overlay.querySelector('.modal-boton')
    if (primerBoton) {
      primerBoton.focus()
    }
  }, 300)
}

/**
 * Genera el HTML completo del modal
 * @param {Object} config - Configuración del modal
 * @returns {string} - HTML del modal
 */
function generarHTML (config) {
  // Determinar la clase CSS del icono según el tipo
  const iconoClase = obtenerClaseIcono(config.tipo)

  // Generar botones según el tipo de modal
  const botones = generarBotones(config)

  return `
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-icon ${iconoClase}">${config.icono}</span>
        <h3 class="modal-titulo">${config.titulo}</h3>
        <p class="modal-mensaje">${config.mensaje}</p>
      </div>
      <div class="modal-footer">
        ${botones}
      </div>
    </div>
  `
}

/**
 * Obtiene la clase CSS del icono según el tipo de modal
 * @param {string} tipo - Tipo de modal
 * @returns {string} - Clase CSS correspondiente
 */
function obtenerClaseIcono (tipo) {
  switch (tipo) {
    case 'alerta':
      return 'alerta'
    case 'confirmacion':
      return 'confirmacion'
    case 'exito':
      return 'exito'
    case 'error':
      return 'error'
    default:
      return 'alerta'
  }
}

/**
 * Genera el HTML de los botones según el tipo de modal
 * @param {Object} config - Configuración del modal
 * @returns {string} - HTML de los botones
 */
function generarBotones (config) {
  if (config.tipo === 'confirmacion') {
    // Modal de confirmación: dos botones
    return `
      <button class="modal-boton ${config.tipoConfirmar}" data-accion="confirmar">
        ${config.botonConfirmar}
      </button>
      <button class="modal-boton ${config.tipoCancelar}" data-accion="cancelar">
        ${config.botonCancelar}
      </button>
    `
  } else {
    // Modal de alerta: un solo botón
    return `
      <button class="modal-boton ${config.botonTipo}" data-accion="aceptar">
        ${config.botonTexto}
      </button>
    `
  }
}

/**
 * Configura los eventos del modal (clicks y teclas)
 * @param {HTMLElement} overlay - Elemento del modal
 * @param {Object} config - Configuración del modal
 * @param {Function} resolve - Función para resolver la promesa
 */
function configurarEventos (overlay, config, resolve) {
  // Manejar clicks en los botones
  overlay.addEventListener('click', (e) => {
    const accion = e.target.dataset.accion
    if (accion) {
      manejarAccion(accion, resolve)
    }
  })

  // Manejar teclas del teclado
  function manejarTecla (e) {
    if (e.key === 'Escape') {
      // Escape = cancelar
      manejarAccion('cancelar', resolve)
    } else if (e.key === 'Enter') {
      // Enter = confirmar o aceptar
      const accionEnter = config.tipo === 'confirmacion' ? 'confirmar' : 'aceptar'
      manejarAccion(accionEnter, resolve)
    }
  }

  // Agregar evento de teclado
  document.addEventListener('keydown', manejarTecla)

  // Guardar referencia para poder quitar el evento después
  overlay.manejarTecla = manejarTecla
}

/**
 * Maneja las acciones de los botones (confirmar, cancelar, aceptar)
 * @param {string} accion - Acción realizada
 * @param {Function} resolve - Función para resolver la promesa
 */
function manejarAccion (accion, resolve) {
  // Determinar resultado según la acción
  const resultado = accion === 'confirmar' || accion === 'aceptar'

  // Cerrar modal
  cerrarModal()

  // Resolver la promesa con el resultado
  resolve(resultado)
}

/**
 * Cierra el modal actual con animación
 */
function cerrarModal () {
  if (!modalActual) return

  // Quitar evento de teclado
  if (modalActual.manejarTecla) {
    document.removeEventListener('keydown', modalActual.manejarTecla)
  }

  // Animación de salida
  modalActual.classList.remove('mostrar')

  // Eliminar del DOM después de la animación
  setTimeout(() => {
    if (modalActual && modalActual.parentNode) {
      modalActual.parentNode.removeChild(modalActual)
    }
    modalActual = null
  }, 300)
}

// =============================================================================
// MÉTODOS PREDEFINIDOS PARA CASOS COMUNES
// =============================================================================

/**
 * Confirma si el usuario quiere salir de la aplicación
 * @returns {Promise<boolean>} - true si confirma salir
 */
async function vaciarCarritoModal () {
  return await mostrarConfirmacion({
    titulo: 'Vaciar carrito',
    mensaje: '¿Estás seguro de que quieres vaciar todo el carrito? Esta acción no se puede deshacer.',
    botonConfirmar: 'Vaciar',
    botonCancelar: 'Cancelar',
    tipoConfirmar: 'peligro'
  })
}

export { vaciarCarritoModal }
// /**
//  * Confirma si el usuario quiere cerrar sesión de admin
//  * @returns {Promise<boolean>} - true si confirma cerrar sesión
//  */
// async function confirmarCerrarSesion () {
//   return await mostrarConfirmacion({
//     titulo: 'Cerrar Sesión',
//     mensaje: '¿Estás seguro de que deseas cerrar la sesión de administrador?',
//     icono: '🔐',
//     botonConfirmar: 'Cerrar Sesión',
//     botonCancelar: 'Cancelar',
//     tipoConfirmar: 'peligro'
//   })
// }

// /**
//  * Confirma si el usuario quiere realizar la compra
//  * @param {number} total - Total de la compra
//  * @returns {Promise<boolean>} - true si confirma la compra
//  */
// async function confirmarCompra (total) {
//   return await mostrarConfirmacion({
//     titulo: 'Confirmar Compra',
//     mensaje: `¿Estás seguro de que deseas realizar la compra por $${total}?`,
//     icono: '🛒',
//     botonConfirmar: 'Comprar',
//     botonCancelar: 'Cancelar',
//     tipoConfirmar: 'exito'
//   })
// }

// /**
//  * Confirma si el usuario quiere eliminar un elemento
//  * @param {string} elemento - Nombre del elemento a eliminar
//  * @returns {Promise<boolean>} - true si confirma la eliminación
//  */
// async function confirmarEliminacion (elemento) {
//   return await mostrarConfirmacion({
//     titulo: 'Confirmar Eliminación',
//     mensaje: `¿Estás seguro de que deseas eliminar ${elemento}? Esta acción no se puede deshacer.`,
//     icono: '🗑️',
//     botonConfirmar: 'Eliminar',
//     botonCancelar: 'Cancelar',
//     tipoConfirmar: 'peligro'
//   })
// }

// /**
//  * Muestra un mensaje de éxito
//  * @param {string} mensaje - Mensaje a mostrar
//  * @returns {Promise<boolean>} - Siempre true
//  */
// async function mostrarExito (mensaje) {
//   return await mostrarAlerta({
//     tipo: 'exito',
//     titulo: '¡Éxito!',
//     mensaje,
//     icono: '✅',
//     botonTexto: 'Genial',
//     botonTipo: 'exito'
//   })
// }

// /**
//  * Muestra un mensaje de error
//  * @param {string} mensaje - Mensaje de error
//  * @returns {Promise<boolean>} - Siempre true
//  */
// async function mostrarError (mensaje) {
//   return await mostrarAlerta({
//     tipo: 'error',
//     titulo: 'Error',
//     mensaje,
//     icono: '❌',
//     botonTexto: 'Entendido',
//     botonTipo: 'peligro'
//   })
// }

// =============================================================================
// EJEMPLOS DE USO
// =============================================================================

/*
// REEMPLAZAR ALERT NATIVO:
// ANTES: alert('Producto agregado')
// DESPUÉS: await mostrarAlerta({ titulo: 'Producto agregado', mensaje: 'El producto fue agregado al carrito' })

// REEMPLAZAR CONFIRM NATIVO:
// ANTES: if (confirm('¿Continuar?')) { ... }
// DESPUÉS: if (await mostrarConfirmacion({ titulo: 'Continuar', mensaje: '¿Deseas continuar?' })) { ... }

// USAR MÉTODOS PREDEFINIDOS:
const quiereSalir = await confirmarSalida()
const quiereCerrarSesion = await confirmarCerrarSesion()
const quiereComprar = await confirmarCompra(1250.50)
const quiereEliminar = await confirmarEliminacion('este producto')

// MOSTRAR MENSAJES DE ESTADO:
await mostrarExito('Compra realizada exitosamente')
await mostrarError('Error al procesar el pago')
*/
