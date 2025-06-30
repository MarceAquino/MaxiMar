import { finalizarCompra } from './carrito-api.js'
import { cambiarCantidadCarrito, carrito, eliminarItemCarrito, vaciarCarrito } from './carrito-manager.js'
import { calcularTotales, formatearPrecio, procesarURLsProducto } from './carrito-utils.js'

const elementos = {
  carritoItems: document.getElementById('carrito-items'),
  carritoVacio: document.getElementById('carrito-vacio'),
  carritoTotal: document.getElementById('carrito-total'),
  carritoSubtotal: document.getElementById('carrito-subtotal'),
  itemsCount: document.getElementById('items-count'),
  totalFijoCantidad: document.getElementById('total-fijo-cantidad'),
  totalItems: document.getElementById('total-items'),
  resumenCarrito: document.getElementById('resumen-carrito'),
  carritoActions: document.getElementById('carrito-actions'),
  totalFijo: document.getElementById('total-fijo'),
  cartCountElement: document.getElementById('cart-icon-count')
}

export function inicializarPaginaCarrito () {
  renderCarrito()
  configurarEventosCarrito()
}

export function renderCarrito () {
  if (!elementos.carritoItems) return
  elementos.carritoItems.innerHTML = ''

  if (carrito.length === 0) {
    actualizarTotales()
    return
  }

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad
    const imagenSrc = procesarURLsProducto(item.urls || item.imagen)[0]

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
    elementos.carritoItems.appendChild(col)
  })

  actualizarTotales()
}

export function actualizarContadorCarrito () {
  const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0)
  if (elementos.cartCountElement) {
    elementos.cartCountElement.textContent = totalItems
  }
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

function mostrarMensaje (msg, tipo = 'info') {
  const alert = document.createElement('div')
  alert.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`
  alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  alert.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `
  document.body.appendChild(alert)

  setTimeout(() => {
    if (alert.parentNode) alert.remove()
  }, 3000)
}
