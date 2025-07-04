/**
 * Utilidades y funciones auxiliares del carrito de compras
 *
 * Módulo que proporciona funciones reutilizables para:
 * - Formateo de precios en moneda local
 * - Procesamiento de URLs de imágenes
 * - Sistema de notificaciones
 * - Validaciones de datos
 */

/**
 * Formatea un precio a moneda argentina
 * @param {number} precio - Precio numérico
 * @returns {string} Precio formateado en ARS
 */
export function formatearPrecio (precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(precio)
}

/**
 * Detecta la página actual del usuario
 * @returns {string} Identificador de página
 */
export function obtenerPaginaActual () {
  const path = window.location.pathname
  if (path.includes('carrito.html')) return 'carrito'
  if (path.includes('productos.html') || path.includes('index.html')) return 'productos'
  return 'general'
}

/**
 * Procesa URLs de imágenes de productos para su visualización
 * @param {string|Array} urls - URLs en diferentes formatos
 * @returns {Array} Array de URLs procesadas
 */
export function procesarURLsProducto (urls) {
  // Si no hay URLs, usar imagen por defecto
  if (!urls) return ['/front-end/img/notFount.png']

  let urlsArray = []

  // Convertir a array según el tipo de entrada
  if (Array.isArray(urls)) {
    urlsArray = urls
  } else if (typeof urls === 'string') {
    try {
      // Intentar parsear como JSON
      urlsArray = JSON.parse(urls)
      if (!Array.isArray(urlsArray)) {
        urlsArray = [urls]
      }
    } catch {
      // Si no es JSON válido, usar como string simple
      urlsArray = [urls]
    }
  }

  // Procesar URLs que pueden estar separadas por comas
  const urlsProcessed = []
  urlsArray.forEach(url => {
    if (typeof url === 'string' && url.includes(',')) {
      const urlsSeparadas = url.split(',').map(u => u.trim()).filter(u => u.length > 0)
      urlsProcessed.push(...urlsSeparadas)
    } else {
      urlsProcessed.push(url)
    }
  })

  // Fallback si no hay URLs válidas
  if (urlsProcessed.length === 0) {
    return ['/front-end/img/notFount.png']
  }

  // Normalizar rutas de imágenes
  return urlsProcessed.map(url => {
    if (url.startsWith('/front-end/')) {
      return url
    }
    if (url.startsWith('nuevos-Producto/')) {
      return `/front-end/img/${url}`
    }
    return `/front-end/img/productos/${url}`
  })
}

// === MENSAJES ===
/**
 * Muestra un mensaje al usuario usando el sistema de alertas disponible
 * @param {string} msg - El mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje: 'info', 'success', 'warning', 'danger'
 */
export function mostrarMensaje (msg, tipo = 'info') {
  // Usar sistema de alertas personalizado si está disponible
  if (window.customAlert) {
    return window.customAlert.show(msg, tipo, { duration: 4000 })
  }

  // Crear alerta Bootstrap como fallback
  const alert = document.createElement('div')
  alert.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`
  alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  alert.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `
  document.body.appendChild(alert)

  // Remover automáticamente después de 3 segundos
  setTimeout(() => {
    if (alert.parentNode) alert.remove()
  }, 3000)
}

// === VALIDACIONES ===
/**
 * Verifica si un valor es un número válido y positivo
 * @param {any} valor - El valor a validar
 * @returns {boolean} true si es un número válido y positivo
 */
export function esNumeroValido (valor) {
  return !isNaN(valor) && isFinite(valor) && valor > 0
}

/**
 * Verifica si una cadena es válida (no vacía ni solo espacios)
 * @param {any} str - La cadena a validar
 * @returns {boolean} true si es una cadena válida
 */
export function esStringValido (str) {
  return typeof str === 'string' && str.trim().length > 0
}
