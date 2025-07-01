// modules/carrito-utils.js - Utilidades y helpers del carrito

// === FORMATEO ===
export function formatearPrecio (precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(precio)
}

// === NAVEGACIÓN ===
export function obtenerPaginaActual () {
  const path = window.location.pathname
  if (path.includes('carrito.html')) return 'carrito'
  if (path.includes('productos.html') || path.includes('index.html')) return 'productos'
  return 'general'
}

// === PROCESAMIENTO DE IMÁGENES ===
export function procesarURLsProducto (urls) {
  if (!urls) return ['/front-end/img/notFount.png']

  let urlsArray = []

  // Si ya es un array, usar directamente
  if (Array.isArray(urls)) {
    urlsArray = urls
  } else if (typeof urls === 'string') {
    // Si es string, podría ser JSON o una URL simple
    try {
      urlsArray = JSON.parse(urls)
      if (!Array.isArray(urlsArray)) {
        urlsArray = [urls]
      }
    } catch {
      urlsArray = [urls]
    }
  }

  // Procesar URLs separadas por comas dentro de un solo elemento
  const urlsProcessed = []
  urlsArray.forEach(url => {
    if (typeof url === 'string' && url.includes(',')) {
      // Si la URL contiene comas, separarla
      const urlsSeparadas = url.split(',').map(u => u.trim()).filter(u => u.length > 0)
      urlsProcessed.push(...urlsSeparadas)
    } else {
      urlsProcessed.push(url)
    }
  })

  if (urlsProcessed.length === 0) {
    return ['/front-end/img/notFount.png']
  }

  // Procesar las URLs para que tengan el formato correcto
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
export function mostrarMensaje (msg, tipo = 'info') {
  // Usar las nuevas alertas personalizadas si están disponibles
  if (window.customAlert) {
    return window.customAlert.show(msg, tipo, { duration: 4000 })
  }

  // Fallback a alertas Bootstrap si no están las personalizadas
  const alert = document.createElement('div')
  alert.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`
  alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  alert.innerHTML = `
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
  document.body.appendChild(alert)

  // Auto-remover después de 3 segundos
  setTimeout(() => {
    if (alert.parentNode) alert.remove()
  }, 3000)
}

export function mostrarMensajeCarrito (mensaje, tipo = 'info') {
  console.log(`💬 Mensaje carrito: ${mensaje} (${tipo})`)

  // Usar alerta de carrito personalizada si está disponible
  if (window.customAlert) {
    return window.customAlert.cart(mensaje, { duration: 4000 })
  }

  // Fallback
  mostrarMensaje(mensaje, tipo)
}

// === VALIDACIONES ===
export function esNumeroValido (valor) {
  return !isNaN(valor) && isFinite(valor) && valor > 0
}

export function esStringValido (str) {
  return typeof str === 'string' && str.trim().length > 0
}
