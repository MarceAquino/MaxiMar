/**
 * IMAGEN MANAGER - Gestión de imágenes de productos
 *
 * Maneja el procesamiento y navegación de imágenes de productos.
 * Soporta diferentes formatos de URLs y navegación entre múltiples imágenes.
 */

const IMAGEN_POR_DEFECTO = '/front-end/img/notFount.png'

/**
 * Obtiene y procesa las imágenes de un producto
 * @param {Object} producto - Producto con propiedad urls
 * @returns {Array<string>} URLs de imágenes procesadas
 */
export function obtenerImagenesProducto (producto) {
  if (!producto.urls) {
    return [IMAGEN_POR_DEFECTO]
  }

  const urls = parsearUrls(producto.urls)
  const urlsProcessed = procesarUrls(urls)

  const finalUrls = urlsProcessed.length === 0
    ? [IMAGEN_POR_DEFECTO]
    : formatearUrls(urlsProcessed)

  return finalUrls
}

/**
 * Parsea URLs desde diferentes formatos (array, JSON string, string simple)
 */
function parsearUrls (urls) {
  if (Array.isArray(urls)) {
    return urls
  }

  if (typeof urls === 'string') {
    try {
      const parsed = JSON.parse(urls)
      return Array.isArray(parsed) ? parsed : [urls]
    } catch (error) {
      return [urls]
    }
  }

  return []
}

/**
 * Procesa URLs que pueden contener múltiples valores separados por comas
 */
function procesarUrls (urls) {
  const urlsProcessed = []

  urls.forEach(url => {
    if (typeof url === 'string' && url.includes(',')) {
      const urlsSeparadas = url.split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0)
      urlsProcessed.push(...urlsSeparadas)
    } else {
      urlsProcessed.push(url)
    }
  })

  return urlsProcessed
}

/**
 * Formatea URLs con las rutas correctas del sistema de archivos
 */
function formatearUrls (urls) {
  return urls.map(url => {
    // URL ya completa
    if (url.startsWith('/front-end/')) {
      return url
    }

    // Productos nuevos
    if (url.startsWith('nuevos-Producto/')) {
      return `/front-end/img/${url}`
    }

    // Solo nombre de archivo -> nuevos productos
    if (!url.includes('/')) {
      return `/front-end/img/nuevos-Producto/${url}`
    }

    // Por defecto -> carpeta productos
    return `/front-end/img/productos/${url}`
  })
}

/**
 * Crea el HTML del contenedor de imágenes con navegación
 * @param {Array<string>} imagenes - URLs de imágenes
 * @param {string} containerId - ID del contenedor
 * @param {string} nombreProducto - Nombre para el alt de la imagen
 * @returns {string} HTML del contenedor
 */
export function crearHTMLImagenes (imagenes, containerId, nombreProducto) {
  const tieneMultiplesImagenes = imagenes.length > 1
  const primeraImagen = imagenes[0]

  const html = `
    <div class="product-image-container ${!tieneMultiplesImagenes ? 'single-image' : ''}" id="${containerId}">
      <img src="${primeraImagen}"
           class="product-image"
           alt="${nombreProducto}"
           data-images='${JSON.stringify(imagenes)}'
           data-current="0"
           onerror="this.onerror=null;this.src='${IMAGEN_POR_DEFECTO}'">

      ${tieneMultiplesImagenes
        ? `
          <button class="image-nav prev" data-container="${containerId}" data-direction="-1">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="image-nav next" data-container="${containerId}" data-direction="1">
            <i class="fas fa-chevron-right"></i>
          </button>
        `
        : ''}
    </div>`

  // Configurar eventos después de insertar el HTML
  setTimeout(() => configurarEventosNavegacion(containerId), 0)

  return html
}

/**
 * Configura los eventos de navegación para un contenedor específico
 */
function configurarEventosNavegacion (containerId) {
  const contenedor = document.getElementById(containerId)
  if (!contenedor) return

  const botones = contenedor.querySelectorAll('.image-nav')
  botones.forEach(boton => {
    boton.addEventListener('click', (e) => {
      e.preventDefault()
      const container = boton.dataset.container
      const direccion = parseInt(boton.dataset.direction)
      cambiarImagen(container, direccion)
    })
  })
}

// FUNCIONES DE NAVEGACIÓN

/**
 * Cambia la imagen actual (anterior/siguiente)
 */
export function cambiarImagen (containerId, direccion) {
  const contenedor = document.getElementById(containerId)
  if (!contenedor) {
    return
  }

  const img = contenedor.querySelector('.product-image')
  if (!img) {
    return
  }

  const imagenes = JSON.parse(img.dataset.images || '[]')
  if (imagenes.length <= 1) return

  let indiceActual = parseInt(img.dataset.current || '0')
  indiceActual = calcularNuevoIndice(indiceActual, direccion, imagenes.length)

  actualizarImagen(img, imagenes, indiceActual, contenedor)
}

/**
 * Establece una imagen específica por índice
 */
export function establecerImagen (containerId, indice) {
  const contenedor = document.getElementById(containerId)
  if (!contenedor) {
    return
  }

  const img = contenedor.querySelector('.product-image')
  if (!img) {
    return
  }

  const imagenes = JSON.parse(img.dataset.images || '[]')
  if (indice < 0 || indice >= imagenes.length) {
    return
  }

  actualizarImagen(img, imagenes, indice, contenedor)
}

// FUNCIONES AUXILIARES

/**
 * Calcula el nuevo índice con navegación circular
 */
function calcularNuevoIndice (indiceActual, direccion, totalImagenes) {
  indiceActual += direccion

  if (indiceActual >= totalImagenes) {
    return 0
  }
  if (indiceActual < 0) {
    return totalImagenes - 1
  }

  return indiceActual
}

/**
 * Actualiza la imagen y sus indicadores
 */
function actualizarImagen (img, imagenes, indice, contenedor) {
  img.src = imagenes[indice]
  img.dataset.current = indice.toString()
  actualizarIndicadoresImagen(contenedor, indice)
}

/**
 * Actualiza los indicadores visuales de posición
 */
function actualizarIndicadoresImagen (contenedor, indiceActivo) {
  const indicadores = contenedor.querySelectorAll('.image-dot')
  indicadores.forEach((indicador, indice) => {
    indicador.classList.toggle('active', indice === indiceActivo)
  })
}

// Exponer función de configuración para uso externo si es necesario
export { configurarEventosNavegacion }
