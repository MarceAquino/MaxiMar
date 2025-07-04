/**
 * Gestor de ventas del dashboard
 * Maneja la carga, renderizado y ordenamiento de ventas
 */

import { API_ROUTES, tokenUtils } from '../../config/api.js'
import { DashboardState } from './dashboard-state.js'

/**
 * Carga todas las ventas desde el servidor
 */
export async function cargarVentas () {
  try {
    const response = await fetch(API_ROUTES.ventas.todas, {
      headers: tokenUtils.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener ventas')
    }

    const ventas = await response.json()
    DashboardState.setVentas(ventas)

    const contador = document.getElementById('contadorVentas')
    if (contador) {
      contador.textContent = `${ventas.length} ventas`
    }

    renderizarVentas()
  } catch (error) {
    DashboardState.setVentas([])
    mostrarErrorVentas()
  }
}

/**
 * Muestra mensaje de error al cargar ventas
 */
function mostrarErrorVentas () {
  const contenedor = document.getElementById('contenedorVentas')
  if (contenedor) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <h5 class="text-danger">Error al cargar ventas</h5>
      </div>
    `
  }
}

/**
 * Renderiza la lista de ventas en el contenedor
 */
export function renderizarVentas () {
  const contenedor = document.getElementById('contenedorVentas')
  if (!contenedor) return

  contenedor.innerHTML = ''

  const ventas = DashboardState.getVentas()
  if (!ventas || ventas.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No hay ventas registradas</h5>
      </div>
    `
    return
  }

  const ordenSelect = document.getElementById('ordenarVentas')
  if (ordenSelect) {
    ordenarVentas(ordenSelect.value, false)
  }

  contenedor.className = 'row g-4'

  ventas.forEach(venta => {
    const tarjeta = crearTarjetaVenta(venta)
    contenedor.appendChild(tarjeta)
  })
}

/**
 * Crea una tarjeta HTML para mostrar una venta
 * @param {Object} venta - Datos de la venta
 * @returns {HTMLElement} Elemento div con la tarjeta de la venta
 */
function crearTarjetaVenta (venta) {
  const div = document.createElement('div')
  div.className = 'col-lg-2-4 col-md-4 col-12'

  const fecha = formatearFecha(venta.fecha_venta || venta.createdAt)
  const total = parseFloat(venta.total || 0).toLocaleString('es-AR')

  div.innerHTML = `
    <div class="venta-card clickable" data-venta-id="${venta.venta_id}">
      <div class="venta-card-content">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h6 class="mb-0">Venta #${venta.venta_id}</h6>
          <span class="venta-total">$${total}</span>
        </div>
        <p class="venta-fecha mb-2">
          <i class="fas fa-calendar me-2"></i>${fecha}
        </p>
        <p class="text-muted mb-2">
          <i class="fas fa-user me-2"></i>${venta.nombre_cliente || 'Cliente Anónimo'}
        </p>
        <p class="text-muted mb-0">
          <i class="fas fa-boxes me-2"></i>${venta.cantidad_productos || 'N/A'} productos
        </p>
      </div>
      <div class="venta-card-overlay">
        <i class="fas fa-eye"></i>
        <span>Ver detalle</span>
      </div>
      <div class="venta-detalle-expandido" style="display: none;"></div>
    </div>
  `

  const ventaCard = div.querySelector('.venta-card')
  ventaCard.addEventListener('click', () => {
    toggleDetalleVenta(ventaCard, venta.venta_id)
  })

  return div
}

/**
 * Formatea una fecha para mostrar de manera legible
 */
function formatearFecha (rawFecha) {
  if (!rawFecha) return 'Fecha no disponible'

  try {
    return new Date(rawFecha.replace(' ', 'T')).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return 'Fecha no disponible'
  }
}

/**
 * Ordena las ventas según el criterio seleccionado
 */
export function ordenarVentas (criterio, render = true) {
  const ventas = DashboardState.getVentas()
  if (!ventas) return

  const obtenerFecha = v => new Date(v.createdAt || v.fecha_venta || 0)

  switch (criterio) {
    case 'fecha-desc':
      ventas.sort((a, b) => obtenerFecha(b) - obtenerFecha(a))
      break
    case 'fecha-asc':
      ventas.sort((a, b) => obtenerFecha(a) - obtenerFecha(b))
      break
    case 'importe-desc':
      ventas.sort((a, b) => parseFloat(b.total || 0) - parseFloat(a.total || 0))
      break
    case 'importe-asc':
      ventas.sort((a, b) => parseFloat(a.total || 0) - parseFloat(b.total || 0))
      break
  }

  DashboardState.setVentas(ventas)
  if (render) renderizarVentas()
}

/**
 * Muestra/oculta el detalle expandido de una venta
 */
export async function toggleDetalleVenta (ventaCard, ventaId) {
  const detalleExpandido = ventaCard.querySelector('.venta-detalle-expandido')

  if (detalleExpandido.style.display !== 'none') {
    detalleExpandido.style.display = 'none'
    ventaCard.classList.remove('expandida')
    return
  }

  ventaCard.classList.add('expandida')
  mostrarCargandoDetalle(detalleExpandido)

  try {
    const response = await fetch(API_ROUTES.ventas.obtener(ventaId), {
      headers: tokenUtils.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener detalle de venta')
    }

    const detalleVenta = await response.json()
    renderizarDetalleVentaExpandido(detalleExpandido, detalleVenta)
  } catch (error) {
    mostrarErrorDetalle(detalleExpandido)
  }
}

/**
 * Muestra el indicador de carga en el detalle
 */
function mostrarCargandoDetalle (detalleExpandido) {
  detalleExpandido.innerHTML = `
    <div class="detalle-loading">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      Cargando detalle...
    </div>
  `
  detalleExpandido.style.display = 'block'
}

/**
 * Muestra error al cargar el detalle
 */
function mostrarErrorDetalle (detalleExpandido) {
  detalleExpandido.innerHTML = `
    <div class="alert alert-danger alert-sm">
      <i class="fas fa-exclamation-triangle me-2"></i>
      Error al cargar el detalle. Inténtalo de nuevo.
    </div>
  `
}

/**
 * Renderiza el detalle completo de una venta
 */
function renderizarDetalleVentaExpandido (contenedor, detalle) {
  const total = parseFloat(detalle.total || 0).toLocaleString('es-AR')
  const numeroOrden = detalle.numero_orden || `#${detalle.venta_id}`
  const productos = detalle.productos || []

  const productosHTML = crearListaProductos(productos)

  contenedor.innerHTML = `
    <div class="detalle-venta-content">
      <div class="detalle-header">
        <div class="row">
          <div class="col-md-6">
            <small class="text-muted">Orden:</small>
            <code class="d-block">${numeroOrden}</code>
          </div>
          <div class="col-md-6">
            <small class="text-muted">Cliente:</small>
            <span class="d-block">${detalle.cliente || 'Cliente Anónimo'}</span>
          </div>
        </div>
      </div>

      <div class="detalle-productos mt-3">
        <h6 class="mb-2">
          <i class="fas fa-shopping-cart me-2"></i>
          Productos (${productos.length})
        </h6>
        <div class="productos-lista">
          ${productosHTML}
        </div>
      </div>

      <div class="detalle-total mt-3">
        <div class="d-flex justify-content-between align-items-center">
          <strong>Total:</strong>
          <strong class="text-success">$${total}</strong>
        </div>
      </div>
    </div>
  `
}

/**
 * Crea el HTML para la lista de productos en el detalle
 */
function crearListaProductos (productos) {
  return productos.map(producto => {
    const subtotal = parseFloat(producto.subtotal || 0).toLocaleString('es-AR')
    const precioUnitario = parseFloat(producto.precio_unitario || 0).toLocaleString('es-AR')

    return `
      <div class="producto-detalle">
        <div class="producto-info">
          <strong>${producto.nombre || 'Producto sin nombre'}</strong>
          <small class="text-muted d-block">
            ${producto.marca || 'Sin marca'} | ${producto.categoria || 'Sin categoría'}
          </small>
          <small class="text-muted">Precio unitario: $${precioUnitario}</small>
        </div>
        <div class="producto-cantidad">${producto.cantidad}x</div>
        <div class="producto-subtotal">$${subtotal}</div>
      </div>
    `
  }).join('')
}
