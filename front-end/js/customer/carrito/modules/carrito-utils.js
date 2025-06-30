import { carrito } from './carrito-manager.js'

export function procesarURLsProducto (urls) {
  if (!urls) return ['/front-end/img/notFount.png']

  let urlsArray = []

  if (Array.isArray(urls)) {
    urlsArray = urls
  } else if (typeof urls === 'string') {
    try {
      urlsArray = JSON.parse(urls)
      if (!Array.isArray(urlsArray)) {
        urlsArray = [urls]
      }
    } catch {
      urlsArray = [urls]
    }
  }

  const urlsProcessed = []
  urlsArray.forEach(url => {
    if (typeof url === 'string' && url.includes(',')) {
      const urlsSeparadas = url.split(',').map(u => u.trim()).filter(u => u.length > 0)
      urlsProcessed.push(...urlsSeparadas)
    } else {
      urlsProcessed.push(url)
    }
  })

  if (urlsProcessed.length === 0) {
    return ['/front-end/img/notFount.png']
  }

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

export function obtenerPaginaActual () {
  const path = window.location.pathname
  if (path.includes('carrito.html')) return 'carrito'
  if (path.includes('productos.html') || path.includes('index.html')) return 'productos'
  return 'general'
}

export function formatearPrecio (precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(precio)
}

export function calcularTotales () {
  let subtotal = 0
  let totalItemsCount = 0

  carrito.forEach(item => {
    subtotal += item.precio * item.cantidad
    totalItemsCount += item.cantidad
  })

  return {
    subtotal,
    total: subtotal,
    items: totalItemsCount
  }
}
