const IMAGEN_POR_DEFECTO = '/front-end/img/notFount.png'

// Función principal para obtener imágenes del producto
export function obtenerImagenesProducto (producto) {
  if (!producto.urls) {
    return [IMAGEN_POR_DEFECTO]
  }

  const urls = parsearUrls(producto.urls)
  const urlsProcessed = procesarUrls(urls)

  return urlsProcessed.length === 0
    ? [IMAGEN_POR_DEFECTO]
    : formatearUrls(urlsProcessed)
}

// Función para parsear URLs (array o JSON string)
function parsearUrls (urls) {
  if (Array.isArray(urls)) {
    return urls
  }

  try {
    const parsed = JSON.parse(urls)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Error al parsear URLs de producto:', error)
    return []
  }
}

// Función para procesar URLs separadas por comas
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

// Función para formatear URLs con las rutas correctas
function formatearUrls (urls) {
  return urls.map(url => {
    if (url.startsWith('/front-end/')) {
      return url
    }
    if (url.startsWith('nuevos-Producto/')) {
      return `/front-end/img/${url}`
    }
    return `/front-end/img/productos/${url}`
  })
}

// Función para crear HTML de imágenes con navegación
export function crearHTMLImagenes (imagenes, containerId, nombreProducto) {
  const tieneMultiplesImagenes = imagenes.length > 1
  const primeraImagen = imagenes[0]

  return `
    <div class="product-image-container ${!tieneMultiplesImagenes ? 'single-image' : ''}" id="${containerId}">
      <img src="${primeraImagen}"
           class="product-image"
           alt="${nombreProducto}"
           data-images='${JSON.stringify(imagenes)}'
           data-current="0"
           onerror="this.onerror=null;this.src='${IMAGEN_POR_DEFECTO}'">

      ${tieneMultiplesImagenes
        ? `
          <button class="image-nav prev" onclick="changeImage('${containerId}', -1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="image-nav next" onclick="changeImage('${containerId}', 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        `
        : ''}
    </div>`
}

// Función para cambiar imagen (navegación)
export function cambiarImagen (containerId, direccion) {
  const contenedor = document.getElementById(containerId)
  if (!contenedor) {
    console.warn(`Contenedor ${containerId} no encontrado`)
    return
  }

  const img = contenedor.querySelector('.product-image')
  if (!img) {
    console.warn('Imagen no encontrada en el contenedor')
    return
  }

  const imagenes = JSON.parse(img.dataset.images || '[]')
  if (imagenes.length <= 1) return

  let indiceActual = parseInt(img.dataset.current || '0')
  indiceActual = calcularNuevoIndice(indiceActual, direccion, imagenes.length)

  actualizarImagen(img, imagenes, indiceActual, contenedor)
}

// Función para establecer imagen específica
export function establecerImagen (containerId, indice) {
  const contenedor = document.getElementById(containerId)
  if (!contenedor) {
    console.warn(`Contenedor ${containerId} no encontrado`)
    return
  }

  const img = contenedor.querySelector('.product-image')
  if (!img) {
    console.warn('Imagen no encontrada en el contenedor')
    return
  }

  const imagenes = JSON.parse(img.dataset.images || '[]')
  if (indice < 0 || indice >= imagenes.length) {
    console.warn(`Indice ${indice} fuera de rango`)
    return
  }

  actualizarImagen(img, imagenes, indice, contenedor)
}

// Función auxiliar para calcular nuevo índice
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

// Función auxiliar para actualizar imagen
function actualizarImagen (img, imagenes, indice, contenedor) {
  img.src = imagenes[indice]
  img.dataset.current = indice.toString()
  actualizarIndicadoresImagen(contenedor, indice)
}

// Función para actualizar indicadores (si existen)
function actualizarIndicadoresImagen (contenedor, indiceActivo) {
  const indicadores = contenedor.querySelectorAll('.image-dot')
  indicadores.forEach((indicador, indice) => {
    indicador.classList.toggle('active', indice === indiceActivo)
  })
}
