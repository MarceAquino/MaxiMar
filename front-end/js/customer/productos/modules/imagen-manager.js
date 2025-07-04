const IMAGEN_POR_DEFECTO = '/front-end/img/notFount.png'

// Función principal para obtener imágenes del producto
export function obtenerImagenesProducto (producto) {
  console.log('🖼️ Procesando imágenes para producto:', producto.nombre, 'URLs originales:', producto.urls)

  if (!producto.urls) {
    console.log('⚠️ No hay URLs de imágenes, usando imagen por defecto')
    return [IMAGEN_POR_DEFECTO]
  }

  const urls = parsearUrls(producto.urls)
  console.log('📋 URLs parseadas:', urls)

  const urlsProcessed = procesarUrls(urls)
  console.log('🔄 URLs procesadas:', urlsProcessed)

  const finalUrls = urlsProcessed.length === 0
    ? [IMAGEN_POR_DEFECTO]
    : formatearUrls(urlsProcessed)

  console.log('✅ URLs finales:', finalUrls)
  return finalUrls
}

// Función para parsear URLs (array o JSON string)
function parsearUrls (urls) {
  // Si ya es un array, devolverlo directamente
  if (Array.isArray(urls)) {
    return urls
  }

  // Si es una string que parece JSON array
  if (typeof urls === 'string') {
    // Intentar parsear como JSON
    try {
      const parsed = JSON.parse(urls)
      return Array.isArray(parsed) ? parsed : [urls]
    } catch (error) {
      // Si no es JSON válido, tratarlo como una sola URL
      console.warn('Error al parsear URLs de producto, usando como string simple:', error)
      return [urls]
    }
  }

  // Si no es ni array ni string, devolver array vacío
  return []
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
    // Si ya es una URL completa que empieza con /front-end/, usarla tal como está
    if (url.startsWith('/front-end/')) {
      return url
    }

    // Si empieza con nuevos-Producto/, agregar el prefijo completo
    if (url.startsWith('nuevos-Producto/')) {
      return `/front-end/img/${url}`
    }

    // Si es solo un nombre de archivo, asumir que va en nuevos-Producto
    if (!url.includes('/')) {
      return `/front-end/img/nuevos-Producto/${url}`
    }

    // Por defecto, asumir que va en la carpeta productos
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
