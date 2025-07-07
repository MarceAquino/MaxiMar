/**
 * Interfaz y renderizado del carrito de compras
 *
 * Este módulo se encarga de:
 * - Renderizar visualmente los items del carrito
 * - Actualizar contadores y totales en tiempo real
 * - Manejar eventos de UI (botones de cantidad, eliminar)
 * - Mostrar/ocultar secciones según el estado del carrito
 */

// Interfaz y renderizado del carrito
import { cambiarCantidadCarrito, eliminarItemCarrito } from './carrito-acciones.js'
import { calcularTotales, obtenerCarrito, obtenerProductoPorId } from './carrito-data.js'
import { formatearPrecio, procesarURLsProducto } from './carrito-utils.js'

// === ELEMENTOS DEL DOM ===
// Cache de elementos frecuentemente utilizados para mejor rendimiento
const elementos = {
  cartCountElement: document.getElementById('cart-icon-count'),
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

// === CONTADOR DEL CARRITO ===

/**
 * Actualiza el contador visual del carrito en el icono
 * Suma todas las cantidades de productos en el carrito
 */
export function actualizarContadorCarrito () {
  const carrito = obtenerCarrito()
  const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0)

  if (elementos.cartCountElement) {
    elementos.cartCountElement.textContent = totalItems
  }
}

// === RENDERIZADO DEL CARRITO ===

/**
 * Renderiza todos los items del carrito en el DOM
 * Maneja tanto carrito vacío como con productos
 */
export function renderCarrito () {
  if (!elementos.carritoItems) return

  elementos.carritoItems.innerHTML = ''
  const carrito = obtenerCarrito()

  if (carrito.length === 0) {
    actualizarTotales()
    return
  }

  carrito.forEach(item => {
    const productoCompleto = obtenerProductoPorId(item.producto_id || item.id) || item
    const subtotal = (item.precio || productoCompleto.precio) * item.cantidad

    const imagenSrc = obtenerImagenProducto(item)
    const itemHTML = crearHTMLItemCarrito(item, imagenSrc, subtotal)

    const col = document.createElement('div')
    col.className = 'col-12'
    col.innerHTML = itemHTML
    elementos.carritoItems.appendChild(col)
  })

  actualizarTotales()
}

// === HELPERS DE RENDERIZADO ===
function obtenerImagenProducto (item) {
  let imagenSrc = '/front-end/img/notFount.png'

  if (item.urls) {
    const urlsProcesadas = procesarURLsProducto(item.urls)
    if (urlsProcesadas.length > 0) {
      imagenSrc = urlsProcesadas[0]
    }
  } else if (item.imagen) {
    imagenSrc = item.imagen
  }

  return imagenSrc
}

function crearHTMLItemCarrito (item, imagenSrc, subtotal) {
  return `
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-2">
            <img src="${imagenSrc}"
                 class="img-fluid rounded"
                 style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #dee2e6;"
                 onerror="this.src='/front-end/img/notFount.png'">
          </div>
          <div class="col-md-4">
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
      </div>
    </div>`
}

// === ACTUALIZACIÓN DE TOTALES ===
export function actualizarTotales () {
  const totales = calcularTotales()
  const carrito = obtenerCarrito()
  const hayProductos = carrito.length > 0

  // Actualizar elementos de totales
  if (elementos.carritoSubtotal) elementos.carritoSubtotal.textContent = formatearPrecio(totales.subtotal)
  if (elementos.carritoTotal) elementos.carritoTotal.textContent = formatearPrecio(totales.total)
  if (elementos.totalFijoCantidad) elementos.totalFijoCantidad.textContent = formatearPrecio(totales.total)
  if (elementos.totalItems) elementos.totalItems.textContent = totales.items
  if (elementos.itemsCount) elementos.itemsCount.textContent = totales.items

  // Mostrar/ocultar elementos según si hay productos
  if (elementos.carritoActions) elementos.carritoActions.style.display = hayProductos ? 'block' : 'none'
  if (elementos.resumenCarrito) elementos.resumenCarrito.style.display = hayProductos ? 'block' : 'none'
  if (elementos.totalFijo) elementos.totalFijo.style.display = hayProductos ? 'block' : 'none'
  if (elementos.carritoVacio) elementos.carritoVacio.style.display = hayProductos ? 'none' : 'block'
}

// === CONFIGURACIÓN DE EVENTOS ===
export function configurarEventosCarrito () {
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
}
