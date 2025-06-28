import { actualizarContadorCarrito, agregarAlCarrito } from '../customer/carrito.js'
import { API_ROUTES } from '../config/api.js'
import { inicializarFiltros } from './filtros-tabs.js'

// ======================================================================
// VARIABLES GLOBALES SIMPLES
// ======================================================================
let productos = [] // Lista de todos los productos cargados desde el servidor

// ======================================================================
// ELEMENTOS DOM PRINCIPALES
// ======================================================================
const elementos = {
  divProductos: document.querySelector('.divProductos'), // Contenedor principal de productos
  cartCountElement: document.getElementById('cart-icon-count') // Contador del carrito
}

// ======================================================================
// CARGA DE PRODUCTOS DESDE EL SERVIDOR
// ======================================================================

/**
 * Carga los productos desde la API del servidor
 * Si falla, intenta cargar desde localStorage como respaldo
 */
async function cargarProductos () {
  console.log('📦 Cargando productos desde el servidor...')

  try {
    // Intentar cargar desde la API
    const response = await fetch(API_ROUTES.productos)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    productos = Array.isArray(data) ? data : []

    console.log(`✅ ${productos.length} productos cargados exitosamente`)

    // Guardar en localStorage como respaldo para offline
    localStorage.setItem('productos', JSON.stringify(productos))
  } catch (error) {
    console.error('❌ Error al cargar productos desde API:', error)

    // Intentar cargar desde localStorage como respaldo
    const productosGuardados = localStorage.getItem('productos')
    if (productosGuardados) {
      productos = JSON.parse(productosGuardados)
      console.log(`⚠️ ${productos.length} productos cargados desde caché local`)
      mostrarMensaje('Productos cargados desde caché local', 'warning')
    } else {
      console.warn('⚠️ No hay productos disponibles')
      productos = []
    }
  }

  // Filtrar productos activos
  productos = productos.filter(producto => producto.activo)
}

// ======================================================================
// INICIALIZACIÓN DE LA PÁGINA
// ======================================================================

/**
 * Inicializa la página de productos con todas sus funcionalidades
 */
function inicializarPaginaProductos () {
  console.log('🚀 Inicializando página de productos...')

  // 1. Renderizar todos los productos
  renderizarProductos(productos)

  // 2. Configurar filtros y tabs
  inicializarFiltros(productos, renderizarProductos)

  // 3. Configurar eventos de los botones
  configurarEventosProductos()

  console.log('✅ Página de productos inicializada')
}

// ======================================================================
// RENDERIZADO DE PRODUCTOS
// ======================================================================

/**
 * Renderiza una lista de productos en la página
 * @param {Array} lista - Lista de productos a mostrar
 */
function renderizarProductos (lista) {
  console.log(`🎨 Renderizando ${lista.length} productos...`)

  // Verificar que el contenedor exista
  if (!elementos.divProductos) {
    console.warn('⚠️ Contenedor de productos no encontrado')
    return
  }

  // Limpiar contenedor
  elementos.divProductos.innerHTML = ''

  // Si no hay productos, mostrar mensaje
  if (!lista.length) {
    elementos.divProductos.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h3>No se encontraron productos</h3>
        <p class="text-muted">Intenta ajustar los filtros</p>
      </div>`
    return
  }

  // Renderizar cada producto
  lista.forEach(producto => {
    // Validar datos mínimos del producto
    if (!producto.producto_id || !producto.nombre || !producto.precio) {
      console.warn('⚠️ Producto con datos incompletos:', producto)
      return
    }

    // Crear tarjeta del producto
    const tarjetaProducto = crearTarjetaProducto(producto)
    elementos.divProductos.appendChild(tarjetaProducto)
  })

  console.log(`✅ ${lista.length} productos renderizados exitosamente`)
}

/**
 * Crea una tarjeta HTML para un producto individual
 * @param {Object} producto - Datos del producto
 * @returns {HTMLElement} Elemento div con la tarjeta del producto
 */
function crearTarjetaProducto (producto) {
  // Calcular estado del stock
  const stock = producto.stock || 0
  const stockClass = stock > 0 ? 'text-success' : 'text-danger'
  const stockTexto = stock > 0 ? stock : 'Sin stock'

  // Preparar las imágenes del producto
  const imagenes = obtenerImagenesProducto(producto)
  const tieneMultiplesImagenes = imagenes.length > 1
  const containerId = `img-container-${producto.producto_id}`

  // Crear contenedor de imagen con navegación
  const imageHTML = crearHTMLImagenes(imagenes, containerId, producto.nombre, tieneMultiplesImagenes)

  // Crear el elemento principal
  const col = document.createElement('div')
  col.className = 'col-12 col-lg-3'

  col.innerHTML = `
    <div class="card h-100 shadow-sm product-card">
      ${imageHTML}
      <div class="card-body card-body-compact d-flex flex-column">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="card-text text-muted small">
          <span class="text-bold">Marca:</span> ${producto.marca || 'Sin marca'}
        </p>
        <p class="card-text ${stockClass} small">
          <span class="text-bold">Stock:</span> ${stockTexto}
        </p>
        <div class="mt-auto">
          <div class="price-section">
            <p class="card-text fs-5 fw-bold price-orange mb-2">
              $${producto.precio.toLocaleString('es-AR')}
            </p>
          </div>
          <button class="btn btn-add-cart w-100 agregarCarrito"
                  data-id="${producto.producto_id}"
                  ${stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart me-2"></i>
            ${stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>`

  return col
}

/**
 * Obtiene las imágenes de un producto, con imagen por defecto si no tiene
 * @param {Object} producto - Datos del producto
 * @returns {Array} Array de URLs de imágenes
 */
function obtenerImagenesProducto (producto) {
  // Si no hay URLs, usar imagen por defecto
  if (!producto.urls) {
    return ['/front-end/img/notFount.png']
  }

  let urls = []

  // Si ya es un array, usar directamente
  if (Array.isArray(producto.urls)) {
    urls = producto.urls
  } else {
    // Si es string (JSON), parsearlo
    try {
      urls = JSON.parse(producto.urls)
      if (!Array.isArray(urls)) {
        urls = []
      }
    } catch (error) {
      console.warn('❌ Error al parsear URLs de producto:', error)
      urls = []
    }
  }

  // Procesar URLs separadas por comas dentro de un solo elemento
  const urlsProcessed = []
  urls.forEach(url => {
    if (typeof url === 'string' && url.includes(',')) {
      // Si la URL contiene comas, separarla
      const urlsSeparadas = url.split(',').map(u => u.trim()).filter(u => u.length > 0)
      urlsProcessed.push(...urlsSeparadas)
    } else {
      urlsProcessed.push(url)
    }
  })

  // Si no hay URLs válidas, usar imagen por defecto
  if (urlsProcessed.length === 0) {
    return ['/front-end/img/notFount.png']
  }

  // Procesar las URLs para que tengan el formato correcto
  return urlsProcessed.map(url => {
    // Si ya es una URL completa que empieza con /front-end, usarla tal como está
    if (url.startsWith('/front-end/')) {
      return url
    }
    // Si es de la carpeta nuevos-Producto, agregarle el prefijo correcto
    if (url.startsWith('nuevos-Producto/')) {
      return `/front-end/img/${url}`
    }
    // Si es una ruta relativa de la estructura antigua, agregarle el prefijo
    return `/front-end/img/productos/${url}`
  })
}

/**
 * Crea el HTML para el contenedor de imágenes con navegación
 * @param {Array} imagenes - Array de URLs de imágenes
 * @param {string} containerId - ID único del contenedor
 * @param {string} nombreProducto - Nombre del producto para alt text
 * @param {boolean} tieneMultiplesImagenes - Si tiene más de una imagen
 * @returns {string} HTML del contenedor de imágenes
 */
function crearHTMLImagenes (imagenes, containerId, nombreProducto, tieneMultiplesImagenes) {
  const primeraImagen = imagenes[0]

  return `
    <div class="product-image-container ${!tieneMultiplesImagenes ? 'single-image' : ''}" id="${containerId}">
      <img src="${primeraImagen}"
           class="product-image"
           alt="${nombreProducto}"
           data-images='${JSON.stringify(imagenes)}'
           data-current="0"
           onerror="this.onerror=null;this.src='/front-end/img/notFount.png'">

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

// ======================================================================
// CONFIGURACIÓN DE EVENTOS
// ======================================================================

/**
 * Configura todos los eventos de la página de productos
 */
function configurarEventosProductos () {
  console.log('🎯 Configurando eventos de productos...')

  // Verificar que el contenedor exista
  if (!elementos.divProductos) {
    console.warn('⚠️ Contenedor de productos no encontrado para eventos')
    return
  }

  // Usar delegación de eventos para manejar botones dinámicos
  elementos.divProductos.addEventListener('click', (e) => {
    // Manejar click en botón "Agregar al carrito"
    const btnAgregar = e.target.closest('.agregarCarrito')
    if (btnAgregar && !btnAgregar.disabled) {
      manejarAgregarAlCarrito(btnAgregar)
    }
  })

  console.log('✅ Eventos configurados correctamente')
}

/**
 * Maneja el evento de agregar producto al carrito
 * @param {HTMLElement} boton - Botón que fue clickeado
 */
function manejarAgregarAlCarrito (boton) {
  // Obtener ID del producto
  const id = parseInt(boton.dataset.id)
  if (isNaN(id)) {
    console.error('❌ ID de producto inválido')
    return
  }

  // Buscar el producto en la lista
  const producto = productos.find(p => p.producto_id === id)
  if (!producto) {
    mostrarMensaje('Producto no encontrado', 'danger')
    return
  }

  // Verificar stock básico en el frontend
  if (producto.stock <= 0) {
    mostrarMensaje('Este producto no tiene stock disponible', 'warning')
    return
  }

  // Agregar al carrito (ahora retorna true/false)
  const agregadoExitoso = agregarAlCarrito(producto)

  if (agregadoExitoso) {
    mostrarFeedbackAgregar(boton)
    actualizarContadorCarrito()
    console.log(`✅ Producto "${producto.nombre}" agregado al carrito`)
  }
}

function mostrarFeedbackAgregar (boton) {
  const toast = document.createElement('div')
  toast.className = 'toast-feedback'
  toast.innerHTML = '<i class="fas fa-check-circle me-2"></i> Producto agregado al carrito'
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 2000)
}

function mostrarMensaje (mensaje, tipo = 'info') {
  console.log(`💬 Mostrando mensaje: ${mensaje} (${tipo})`)

  // Usar las nuevas alertas personalizadas si están disponibles
  if (window.customAlert) {
    return window.customAlert.show(mensaje, tipo, { duration: 4000 })
  }

  const alerta = document.createElement('div')
  alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`
  alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  alerta.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
  `

  document.body.appendChild(alerta)

  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.remove()
    }
  }, 3000)
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando aplicación de productos...')

  try {
    await cargarProductos()

    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      console.log('📦 Carrito encontrado en localStorage')
    }

    inicializarPaginaProductos()

    actualizarContadorCarrito()

    console.log('✅ Aplicación de productos iniciada correctamente')
  } catch (error) {
    console.error('❌ Error al inicializar aplicación:', error)
    mostrarMensaje('Error al cargar la aplicación', 'danger')
  }
})

export {
  cargarProductos,
  inicializarPaginaProductos,
  productos,
  renderizarProductos
}

window.changeImage = function (containerId, direccion) {
  const contenedor = document.getElementById(containerId)
  if (!contenedor) {
    console.warn(`⚠️ Contenedor ${containerId} no encontrado`)
    return
  }

  const img = contenedor.querySelector('.product-image')
  if (!img) {
    console.warn('⚠️ Imagen no encontrada en el contenedor')
    return
  }

  const imagenes = JSON.parse(img.dataset.images || '[]')
  if (imagenes.length <= 1) {
    return
  }

  let indiceActual = parseInt(img.dataset.current || '0')
  indiceActual += direccion

  if (indiceActual >= imagenes.length) {
    indiceActual = 0
  }
  if (indiceActual < 0) {
    indiceActual = imagenes.length - 1
  }

  img.src = imagenes[indiceActual]
  img.dataset.current = indiceActual.toString()

  actualizarIndicadoresImagen(contenedor, indiceActual)

  console.log(`🖼️ Imagen cambiada a índice ${indiceActual}`)
}

window.setImage = function (containerId, indice) {
  const contenedor = document.getElementById(containerId)
  if (!contenedor) {
    console.warn(`⚠️ Contenedor ${containerId} no encontrado`)
    return
  }

  const img = contenedor.querySelector('.product-image')
  if (!img) {
    console.warn('⚠️ Imagen no encontrada en el contenedor')
    return
  }

  const imagenes = JSON.parse(img.dataset.images || '[]')
  if (indice < 0 || indice >= imagenes.length) {
    console.warn(`⚠️ Índice ${indice} fuera de rango`)
    return
  }

  img.src = imagenes[indice]
  img.dataset.current = indice.toString()

  actualizarIndicadoresImagen(contenedor, indice)

  console.log(`🖼️ Imagen establecida en índice ${indice}`)
}

function actualizarIndicadoresImagen (contenedor, indiceActivo) {
  const indicadores = contenedor.querySelectorAll('.image-dot')
  indicadores.forEach((indicador, indice) => {
    indicador.classList.toggle('active', indice === indiceActivo)
  })
}
