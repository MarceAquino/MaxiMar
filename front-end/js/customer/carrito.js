import { API_URL, API_ROUTES } from '../config/api.js'

// ======================================================================
// VARIABLES GLOBALES SIMPLES
// ======================================================================
let carrito = [] // Array que contiene todos los productos del carrito
let productosDisponibles = [] // Array con todos los productos disponibles

// ======================================================================
// FUNCIONES DE PRODUCTOS
// ======================================================================

/**
 * Procesa las URLs de un producto para manejar casos con URLs separadas por comas
 * @param {Array|string} urls - URLs del producto
 * @returns {Array} Array de URLs procesadas
 */
function procesarURLsProducto (urls) {
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

/**
 * Carga los productos desde la API
 */
async function cargarProductos () {
  try {
    const response = await fetch(API_ROUTES.productos)
    if (!response.ok) {
      throw new Error('Error al obtener productos')
    }
    productosDisponibles = await response.json()
    console.log(`✅ ${productosDisponibles.length} productos cargados para validación de stock`)
  } catch (error) {
    console.error('❌ Error cargando productos:', error)
    productosDisponibles = []
  }
}

/**
 * Obtiene un producto por ID desde los productos cargados
 * @param {number} id - ID del producto
 * @returns {Object|null} Producto encontrado o null
 */
function obtenerProductoPorId (id) {
  return productosDisponibles.find(p => p.producto_id === id) || null
}

/**
 * Verifica si hay stock suficiente para un producto
 * @param {number} productoId - ID del producto
 * @param {number} cantidadDeseada - Cantidad que se quiere agregar
 * @returns {Object} { disponible: boolean, stockActual: number, mensaje: string }
 */
function verificarStock (productoId, cantidadDeseada) {
  const producto = obtenerProductoPorId(productoId)

  if (!producto) {
    return {
      disponible: false,
      stockActual: 0,
      mensaje: 'Producto no encontrado'
    }
  }

  if (!producto.activo) {
    return {
      disponible: false,
      stockActual: 0,
      mensaje: 'Producto no disponible'
    }
  }

  // Calcular cantidad actual en el carrito
  const itemEnCarrito = carrito.find(item => (item.producto_id || item.id) === productoId)
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0
  const cantidadTotal = cantidadEnCarrito + cantidadDeseada

  if (cantidadTotal > producto.stock) {
    return {
      disponible: false,
      stockActual: producto.stock,
      cantidadEnCarrito,
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, en carrito: ${cantidadEnCarrito}`
    }
  }

  return {
    disponible: true,
    stockActual: producto.stock,
    cantidadEnCarrito,
    mensaje: 'Stock disponible'
  }
}

// ======================================================================
// ELEMENTOS DOM PRINCIPALES
// ======================================================================
const elementos = {
  // Elementos del contador del carrito
  cartCountElement: document.getElementById('cart-icon-count'),

  // Elementos de la página del carrito
  carritoItems: document.getElementById('carrito-items'),
  carritoVacio: document.getElementById('carrito-vacio'),
  carritoTotal: document.getElementById('carrito-total'),
  carritoSubtotal: document.getElementById('carrito-subtotal'),
  itemsCount: document.getElementById('items-count'),
  totalFijoCantidad: document.getElementById('total-fijo-cantidad'),
  totalItems: document.getElementById('total-items'),
  resumenCarrito: document.getElementById('resumen-carrito'),
  carritoActions: document.getElementById('carrito-actions'),
  totalFijo: document.getElementById('total-fijo')
}

// ======================================================================
// GESTIÓN DEL CARRITO EN LOCALSTORAGE
// ======================================================================

/**
 * Carga el carrito desde localStorage
 */
function cargarCarrito () {
  console.log('📦 Cargando carrito desde localStorage...')

  const carritoGuardado = localStorage.getItem('carrito')
  carrito = carritoGuardado ? JSON.parse(carritoGuardado) : []

  console.log(`✅ Carrito cargado: ${carrito.length} productos`)
}

/**
 * Guarda el carrito en localStorage
 */
function guardarCarrito () {
  localStorage.setItem('carrito', JSON.stringify(carrito))
  console.log('💾 Carrito guardado en localStorage')
}

// ======================================================================
// FUNCIONES PRINCIPALES DEL CARRITO
// ======================================================================

/**
 * Agrega un producto al carrito o incrementa su cantidad
 * @param {Object} producto - Producto a agregar
 * @returns {boolean} true si se agregó exitosamente, false si no
 */
function agregarAlCarrito (producto) {
  console.log('🛒 Intentando agregar producto al carrito:', producto.nombre)

  const id = producto.producto_id || producto.id

  // Verificar stock antes de agregar
  const verificacion = verificarStock(id, 1)

  if (!verificacion.disponible) {
    console.warn('⚠️ No se puede agregar al carrito:', verificacion.mensaje)
    mostrarMensajeCarrito(verificacion.mensaje, 'warning')
    return false
  }

  const existe = carrito.find(item => (item.producto_id || item.id) === id)

  if (existe) {
    // Si ya existe, incrementar cantidad
    existe.cantidad += 1
    console.log(`📈 Cantidad incrementada a ${existe.cantidad}`)
  } else {
    // Si no existe, agregar nuevo
    carrito.push({
      ...producto,
      producto_id: id,
      id,
      cantidad: 1
    })
    console.log('✅ Producto agregado como nuevo item')
  }

  // Guardar cambios
  guardarCarrito()
  actualizarContadorCarrito()

  // Si estamos en la página del carrito, re-renderizar
  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }

  return true
}

/**
 * Elimina un producto completamente del carrito
 * @param {number} id - ID del producto a eliminar
 */
function eliminarItemCarrito (id) {
  console.log('🗑️ Eliminando producto del carrito:', id)

  const productoAntes = carrito.find(item => (item.producto_id || item.id) === id)
  if (productoAntes) {
    console.log(`❌ Eliminando "${productoAntes.nombre}"`)
  }
  carrito = carrito.filter(item => (item.producto_id || item.id) !== id)

  // Guardar cambios
  guardarCarrito()
  actualizarContadorCarrito()

  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }
}

/**
 * Cambia la cantidad de un producto en el carrito
 * @param {number} id - ID del producto
 * @param {number} cambio - Cambio en la cantidad (+1, -1, etc.)
 */
function cambiarCantidadCarrito (id, cambio) {
  console.log(`🔢 Cambiando cantidad del producto ${id} en ${cambio}`)

  const item = carrito.find(item => (item.producto_id || item.id) === id)
  if (!item) {
    console.warn('⚠️ Producto no encontrado en el carrito')
    return
  }

  // Si es incremento (+1), verificar stock
  if (cambio > 0) {
    const verificacion = verificarStock(id, cambio)
    if (!verificacion.disponible) {
      console.warn('⚠️ No se puede incrementar cantidad:', verificacion.mensaje)
      mostrarMensajeCarrito(verificacion.mensaje, 'warning')
      return
    }
  }

  item.cantidad += cambio
  if (item.cantidad < 1) {
    // Si la cantidad es menor a 1, eliminar el producto
    eliminarItemCarrito(id)
  } else {
    console.log(`✅ Nueva cantidad: ${item.cantidad}`)

    // Guardar cambios
    guardarCarrito()
    actualizarContadorCarrito()

    if (obtenerPaginaActual() === 'carrito') {
      renderCarrito()
    }
  }
}

/**
 * Vacía completamente el carrito
 */
function vaciarCarrito () {
  console.log('🧹 Vaciando carrito completo...')

  carrito = []

  // Guardar cambios
  guardarCarrito()
  actualizarContadorCarrito()
  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }

  console.log('✅ Carrito vaciado')
}

/**
 * Actualiza el contador visual del carrito en la interfaz
 */
function actualizarContadorCarrito () {
  // Asegurar que el carrito esté cargado
  if (!carrito || carrito.length === 0) {
    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado)
    }
  }

  const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0)

  // Actualizar elemento del contador si existe
  const cartCountElement = document.getElementById('cart-icon-count')
  if (cartCountElement) {
    cartCountElement.textContent = totalItems
  }

  console.log(`🔢 Contador actualizado: ${totalItems} items`)
}

/**
 * Determina en qué página estamos actualmente
 * @returns {string} Nombre de la página actual
 */
function obtenerPaginaActual () {
  const path = window.location.pathname
  if (path.includes('carrito.html')) return 'carrito'
  if (path.includes('productos.html') || path.includes('index.html')) return 'productos'
  return 'general'
}

// === PÁGINA DEL CARRITO ===
async function inicializarPaginaCarrito () {
  // Cargar productos para validación de stock
  await cargarProductos()
  renderCarrito()
  configurarEventosCarrito()
}

function renderCarrito () {
  if (!elementos.carritoItems) return
  elementos.carritoItems.innerHTML = ''

  if (carrito.length === 0) {
    actualizarTotales()
    return
  }

  carrito.forEach(item => {
    const productoCompleto = productosDisponibles.find(p => p.producto_id === (item.producto_id || item.id)) || item
    const subtotal = (item.precio || productoCompleto.precio) * item.cantidad

    let imagenSrc = '/front-end/img/notFount.png'
    if (item.urls) {
      // Procesar URLs que pueden tener formato "url1,url2,url3" en un solo elemento
      const urlsProcesadas = procesarURLsProducto(item.urls)
      if (urlsProcesadas.length > 0) {
        imagenSrc = urlsProcesadas[0]
      }
    } else if (item.imagen) {
      imagenSrc = item.imagen
    }

    const col = document.createElement('div')
    col.className = 'col-12'
    col.innerHTML = `
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-2">
              <img src="${imagenSrc}"
                   class="img-fluid rounded"
                   style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #dee2e6;"
                   onerror="this.src='/front-end/img/notFount.png'">
            </div>            <div class="col-md-4">
              <h5 class="card-title">${item.nombre}</h5>
              <p class="text-muted small"><strong>Marca: ${item.marca || 'N/A'}</strong></p>
            </div>
            <div class="col-md-2 text-center">
              <span class="fw-bold">${formatearPrecio(item.precio)}</span>
            </div>
            <div class="col-md-2 text-center">
              <div class="input-group input-group-sm">
                <button class="btn btn-outline-secondary btn-cantidad" data-id="${item.producto_id}" data-cambio="-1">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="text" class="form-control text-center" value="${item.cantidad}" readonly>
                <button class="btn btn-outline-secondary btn-cantidad" data-id="${item.producto_id}" data-cambio="1">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <div class="col-md-2 text-center">
              <span class="fw-bold text-success">${formatearPrecio(subtotal)}</span>
              <button class="btn btn-sm btn-outline-danger mt-1 btn-eliminar" data-id="${item.producto_id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>      </div>`
    elementos.carritoItems.appendChild(col)
  })

  actualizarTotales()
}

function configurarEventosCarrito () {
  // Eventos para botones de cantidad y eliminar
  if (elementos.carritoItems) {
    elementos.carritoItems.addEventListener('click', (e) => {
      const btnCantidad = e.target.closest('.btn-cantidad')
      const btnEliminar = e.target.closest('.btn-eliminar')

      if (btnCantidad) {
        const id = parseInt(btnCantidad.dataset.id)
        const cambio = parseInt(btnCantidad.dataset.cambio)
        cambiarCantidadCarrito(id, cambio)
      } else if (btnEliminar) {
        const id = parseInt(btnEliminar.dataset.id)
        if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
          eliminarItemCarrito(id)
        }
      }
    })
  }

  // Botón vaciar carrito
  const vaciarBtn = document.getElementById('vaciar-carrito')
  if (vaciarBtn) {
    vaciarBtn.addEventListener('click', () => {
      if (carrito.length === 0) {
        mostrarMensaje('El carrito ya está vacío', 'info')
        return
      }

      if (confirm('¿Estás seguro de que quieres vaciar todo el carrito? Esta acción no se puede deshacer.')) {
        vaciarCarrito()
        mostrarMensaje('Carrito vaciado correctamente', 'success')
      }
    })
  }

  // Finalizar compra
  const finalizarBtn = document.getElementById('btn-finalizar-compra')
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', finalizarCompra)
  }
}

function actualizarTotales () {
  const totales = calcularTotales()

  if (elementos.carritoSubtotal) elementos.carritoSubtotal.textContent = formatearPrecio(totales.subtotal)
  if (elementos.carritoTotal) elementos.carritoTotal.textContent = formatearPrecio(totales.total)
  if (elementos.totalFijoCantidad) elementos.totalFijoCantidad.textContent = formatearPrecio(totales.total)
  if (elementos.totalItems) elementos.totalItems.textContent = totales.items
  if (elementos.itemsCount) elementos.itemsCount.textContent = totales.items

  const hayProductos = carrito.length > 0
  if (elementos.carritoActions) elementos.carritoActions.style.display = hayProductos ? 'block' : 'none'
  if (elementos.resumenCarrito) elementos.resumenCarrito.style.display = hayProductos ? 'block' : 'none'
  if (elementos.totalFijo) elementos.totalFijo.style.display = hayProductos ? 'block' : 'none'
  if (elementos.carritoVacio) elementos.carritoVacio.style.display = hayProductos ? 'none' : 'block'
}

function calcularTotales () {
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

async function finalizarCompra () {
  if (carrito.length === 0) {
    mostrarMensaje('Tu carrito está vacío', 'warning')
    return
  }

  // Obtener nombre del usuario desde localStorage
  const nombreUsuario = localStorage.getItem('nombreUsuario')
  const cliente = nombreUsuario || 'Cliente Anónimo'

  // CONFIRMACIÓN ANTES DE PROCESAR LA COMPRA
  const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0)
  const totalCompra = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0)

  const confirmMessage = `¿Estás seguro de realizar esta compra?

📋 Resumen:
• ${cantidadItems} producto${cantidadItems !== 1 ? 's' : ''}
• Total: $${totalCompra.toLocaleString('es-AR')}
• Cliente: ${cliente}

Esta acción no se puede deshacer.`

  if (!confirm(confirmMessage)) {
    return // El usuario canceló la compra
  }
  try {
    // Preparar datos para enviar al backend
    const ventaData = {
      cliente,
      items: carrito.map(item => ({
        producto_id: item.producto_id || item.id,
        cantidad: item.cantidad
      }))
    }

    mostrarMensaje('Procesando compra...', 'info')

    // Enviar venta al backend
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ventaData)
    })

    const data = await response.json()

    if (response.ok) {
      // Guardar ID de venta en localStorage para mostrar en ticket
      localStorage.setItem('ultima_venta_id', data.venta.venta_id)

      // Limpiar carrito
      carrito = []
      guardarCarrito()

      // Redirigir a ticket
      window.location.href = '/front-end/html/customer/ticket.html'
    } else {
      mostrarMensaje(`Error: ${data.message}`, 'danger')
    }
  } catch (error) {
    console.error('Error al procesar compra:', error)
    mostrarMensaje('Error de conexión. Intenta nuevamente.', 'danger')
  }
}

// === UTILIDADES ===
function formatearPrecio (precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(precio)
}

function mostrarMensaje (msg, tipo = 'info') {
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

/**
 * Muestra un mensaje específico para operaciones del carrito
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (success, warning, danger, info)
 */
function mostrarMensajeCarrito (mensaje, tipo = 'info') {
  console.log(`💬 Mensaje carrito: ${mensaje} (${tipo})`)

  // Usar alerta de carrito personalizada si está disponible
  if (window.customAlert) {
    return window.customAlert.cart(mensaje, { duration: 4000 })
  }

  // Fallback
  mostrarMensaje(mensaje, tipo)
}

// ======================================================================
// FUNCIONES AUXILIARES PÚBLICAS
// ======================================================================

/**
 * Obtiene el carrito actual desde localStorage
 * @returns {Array} Array con los items del carrito
 */
function obtenerCarritoActual () {
  const carritoGuardado = localStorage.getItem('carrito')
  return carritoGuardado ? JSON.parse(carritoGuardado) : []
}

/**
 * Calcula la cantidad total de items en el carrito
 * @returns {number} Cantidad total de items
 */
function obtenerCantidadTotalCarrito () {
  const carritoActual = obtenerCarritoActual()
  return carritoActual.reduce((suma, item) => suma + item.cantidad, 0)
}

// ======================================================================

// === INICIALIZACIÓN PARA PÁGINA CARRITO ===
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar carrito desde localStorage
  cargarCarrito()

  // Cargar productos para validación de stock
  await cargarProductos()

  // Actualizar contador del carrito
  actualizarContadorCarrito()

  // Si estamos en la página del carrito, inicializar
  if (obtenerPaginaActual() === 'carrito') {
    await inicializarPaginaCarrito()
  }

  // === EXPORTAR FUNCIONES GLOBALES ===
  window.agregarAlCarrito = agregarAlCarrito
  window.eliminarItemCarrito = eliminarItemCarrito
  window.cambiarCantidadCarrito = cambiarCantidadCarrito
  window.vaciarCarrito = vaciarCarrito
  window.finalizarCompra = finalizarCompra
})

// ======================================================================
// EXPORTACIONES ES6
// ======================================================================
export {
  actualizarContadorCarrito,
  agregarAlCarrito,
  cambiarCantidadCarrito,
  cargarCarrito,
  carrito,
  eliminarItemCarrito,
  inicializarPaginaCarrito,
  obtenerCantidadTotalCarrito,
  obtenerCarritoActual,
  renderCarrito,
  vaciarCarrito
}
