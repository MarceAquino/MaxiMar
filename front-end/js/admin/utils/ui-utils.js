// ======================================================================
// UTILIDADES DE UI Y FEEDBACK COMPARTIDAS
// ======================================================================
// Este módulo contiene funciones para mostrar mensajes, errores y feedback
// de manera consistente en toda la aplicación

/**
 * Muestra errores de validación al usuario de forma amigable
 * @param {Array} errores - Lista de errores a mostrar
 * @param {Object} options - Opciones de presentación
 * @param {string} options.titulo - Título personalizado para el mensaje
 * @param {boolean} options.numerado - Si numerar los errores (por defecto true)
 * @param {string} options.icono - Icono a mostrar (por defecto ❌)
 */
export function mostrarErrores (errores, options = {}) {
  const {
    titulo = 'Se encontraron los siguientes errores',
    numerado = true,
    icono = '❌'
  } = options

  if (!errores || errores.length === 0) {
    return
  }

  let mensaje = `${icono} ${titulo}:\n\n`

  errores.forEach((error, index) => {
    if (numerado) {
      mensaje += `${index + 1}. ${error}\n`
    } else {
      mensaje += `• ${error}\n`
    }
  })

  mensaje += '\n💡 Corrija estos errores e intente nuevamente.'

  // Mostrar alert con pausa
  setTimeout(() => {
    alert(mensaje)
  }, 100)
}

/**
 * Muestra mensaje de éxito
 * @param {string} mensaje - Mensaje a mostrar
 * @param {Object} options - Opciones adicionales
 * @param {string} options.icono - Icono a mostrar (por defecto ✅)
 */
export function mostrarExito (mensaje, options = {}) {
  const { icono = '✅' } = options
  alert(`${icono} ${mensaje}`)
}

/**
 * Muestra mensaje de advertencia
 * @param {string} mensaje - Mensaje a mostrar
 * @param {Object} options - Opciones adicionales
 * @param {string} options.icono - Icono a mostrar (por defecto ⚠️)
 */
export function mostrarAdvertencia (mensaje, options = {}) {
  const { icono = '⚠️' } = options
  alert(`${icono} ${mensaje}`)
}

/**
 * Muestra confirmación y retorna la respuesta del usuario
 * @param {string} mensaje - Mensaje de confirmación
 * @param {Object} options - Opciones adicionales
 * @param {string} options.icono - Icono a mostrar (por defecto ❓)
 * @returns {boolean} true si el usuario confirma, false si cancela
 */
export function mostrarConfirmacion (mensaje, options = {}) {
  const { icono = '❓' } = options
  return confirm(`${icono} ${mensaje}`)
}

/**
 * Muestra tooltip de error para un campo
 * @param {HTMLElement} elemento - Elemento al que agregar el tooltip
 * @param {string} mensaje - Mensaje de error
 */
export function mostrarTooltipError (elemento, mensaje) {
  if (!elemento) return

  // Remover tooltip existente
  ocultarTooltipError(elemento)

  // Crear nuevo tooltip
  const tooltip = document.createElement('div')
  tooltip.className = 'invalid-tooltip'
  tooltip.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    background: #dc3545;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-top: 2px;
  `
  tooltip.textContent = mensaje
  tooltip.setAttribute('data-error-tooltip', 'true')

  // Hacer que el contenedor sea relativo
  elemento.style.position = 'relative'
  elemento.parentNode.style.position = 'relative'
  elemento.parentNode.appendChild(tooltip)
}

/**
 * Oculta tooltip de error de un campo
 * @param {HTMLElement} elemento - Elemento del que remover el tooltip
 */
export function ocultarTooltipError (elemento) {
  if (!elemento || !elemento.parentNode) return

  const tooltip = elemento.parentNode.querySelector('[data-error-tooltip]')
  if (tooltip) {
    tooltip.remove()
  }
}

/**
 * Establece estado visual de validación en un campo
 * @param {HTMLElement} elemento - Elemento a modificar
 * @param {boolean} esValido - Si el campo es válido
 * @param {string} mensajeError - Mensaje de error a mostrar (opcional)
 */
export function establecerEstadoValidacion (elemento, esValido, mensajeError = '') {
  if (!elemento) return

  // Limpiar estados previos
  elemento.classList.remove('is-valid', 'is-invalid')
  ocultarTooltipError(elemento)

  // Establecer nuevo estado
  if (esValido) {
    elemento.classList.add('is-valid')
  } else {
    elemento.classList.add('is-invalid')
    if (mensajeError) {
      mostrarTooltipError(elemento, mensajeError)
    }
  }
}

/**
 * Limpia el estado de validación de un campo
 * @param {HTMLElement} elemento - Elemento a limpiar
 */
export function limpiarEstadoValidacion (elemento) {
  if (!elemento) return

  elemento.classList.remove('is-valid', 'is-invalid')
  ocultarTooltipError(elemento)
}

/**
 * Deshabilita un botón temporalmente y devuelve el estado original
 * @param {HTMLElement} boton - Botón a deshabilitar
 * @param {string} textoTemporal - Texto a mostrar mientras está deshabilitado
 * @param {number} duracion - Duración en milisegundos (por defecto 2000)
 * @returns {Object|null} Estado original del botón o null si no hay botón
 */
export function deshabilitarBotonTemporal (boton, textoTemporal, duracion = 2000) {
  if (!boton) return null

  const estadoOriginal = {
    texto: boton.textContent,
    deshabilitado: boton.disabled
  }

  boton.disabled = true
  boton.textContent = textoTemporal

  // Devolver el estado original inmediatamente
  // El setTimeout se mantiene para la restauración automática
  setTimeout(() => {
    boton.disabled = estadoOriginal.deshabilitado
    boton.textContent = estadoOriginal.texto
  }, duracion)

  return estadoOriginal
}

/**
 * Muestra feedback de éxito con opción de redirección
 * @param {Object} data - Datos de respuesta del servidor
 * @param {Object} options - Opciones de configuración
 * @param {string} options.titulo - Título del mensaje
 * @param {string} options.urlRedireccion - URL para redirección opcional
 * @param {string} options.textoRedireccion - Texto para el botón de redirección
 * @param {Function} options.callbackLimpiar - Función a ejecutar si no redirige
 */
export function mostrarFeedbackExito (data, options = {}) {
  const {
    titulo = 'Operación completada exitosamente',
    urlRedireccion = null,
    textoRedireccion = 'Ir al Dashboard',
    callbackLimpiar = null
  } = options

  let mensaje = `✅ ${titulo}`

  // Agregar información adicional si está disponible
  if (data.message) {
    mensaje += `\n\n${data.message}`
  }

  if (data.images && data.images.length > 0) {
    mensaje += `\n📸 Imágenes guardadas: ${data.images.length}`
  }

  if (data.warning) {
    mensaje += `\n⚠️ Advertencia: ${data.warning}`
  }

  // Agregar opción de redirección si se proporciona
  if (urlRedireccion) {
    mensaje += `\n\n¿Desea ${textoRedireccion.toLowerCase()}?`

    setTimeout(() => {
      try {
        const irADashboard = confirm(mensaje)

        if (irADashboard) {
          window.location.href = urlRedireccion
        } else if (callbackLimpiar) {
          callbackLimpiar()
        }
      } catch (error) {
        console.error('❌ Error en confirm:', error)
        alert('Operación completada exitosamente!')
      }
    }, 500)
  } else {
    alert(mensaje)
    if (callbackLimpiar) {
      setTimeout(callbackLimpiar, 300)
    }
  }
}
