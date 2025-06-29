import { API_ROUTES, tokenUtils } from '../../config/api.js'
import { DashboardState } from './dashboard-state.js'

export async function cargarVentas () {
  console.log('📦 Cargando ventas...')

  try {
    // Usar la ruta correcta para obtener todas las ventas
    const response = await fetch(API_ROUTES.ventas.todas, {
      headers: tokenUtils.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener ventas del servidor')
    }

    const ventas = await response.json()
    console.log(`✅ ${ventas.length} ventas cargadas`)

    DashboardState.setVentas(ventas)

    // Actualizar contador
    const contador = document.getElementById('contadorVentas')
    if (contador) {
      contador.textContent = `${ventas.length} ventas`
    }
  } catch (error) {
    console.error('❌ Error cargando ventas:', error)
    DashboardState.setVentas([])
  }
}

export function renderizarVentas () {
  const contenedor = document.getElementById('contenedorVentas')

  if (!contenedor) {
    console.warn('⚠️ Contenedor de ventas no encontrado')
    return
  }

  contenedor.innerHTML = ''

  const ventas = DashboardState.getVentas()

  if (ventas.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No hay ventas registradas</h5>
      </div>
    `
    return
  }

  // Ordenar ventas según el filtro seleccionado
  const ordenSelect = document.getElementById('ordenarVentas')
  if (ordenSelect) {
    ordenarVentas(ordenSelect.value)
  }

  contenedor.className = 'row g-4'

  ventas.forEach(venta => {
    const div = document.createElement('div')
    div.className = 'col-lg-2-4 col-md-4 col-12'

    const fecha = new Date(venta.createdAt).toLocaleDateString('es-AR')
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
            <i class="fas fa-user me-2"></i>${venta.nombre_cliente}
          </p>
          <p class="text-muted mb-0">
            <i class="fas fa-boxes me-2"></i>${venta.cantidad_productos || 'N/A'} productos
          </p>
        </div>
        <div class="venta-card-overlay">
          <i class="fas fa-eye"></i>
          <span>Ver detalle</span>
        </div>
        <div class="venta-detalle-expandido" style="display: none;">
          <!-- El detalle se cargará aquí -->
        </div>
      </div>
    `

    // Agregar event listener para el click
    const ventaCard = div.querySelector('.venta-card')
    ventaCard.addEventListener('click', () => {
      toggleDetalleVenta(ventaCard, venta.venta_id)
    })

    contenedor.appendChild(div)
  })
}

export function ordenarVentas (criterio) {
  const ventas = DashboardState.getVentas()

  switch (criterio) {
    case 'fecha-desc':
      ventas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'fecha-asc':
      ventas.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'importe-desc':
      ventas.sort((a, b) => parseFloat(b.total || 0) - parseFloat(a.total || 0))
      break
    case 'importe-asc':
      ventas.sort((a, b) => parseFloat(a.total || 0) - parseFloat(b.total || 0))
      break
  }

  DashboardState.setVentas(ventas)
}

export async function toggleDetalleVenta (ventaCard, ventaId) {
  const detalleExpandido = ventaCard.querySelector('.venta-detalle-expandido')
  const chevron = ventaCard.querySelector('.fa-chevron-down, .fa-chevron-up')

  // Si ya está expandido, colapsarlo
  if (detalleExpandido.style.display !== 'none') {
    detalleExpandido.style.display = 'none'
    ventaCard.classList.remove('expandida')
    if (chevron) {
      chevron.className = 'fas fa-chevron-down'
    }
    return
  }

  // Si no está expandido, expandirlo
  console.log('🔍 Mostrando detalle de venta:', ventaId)

  // Cambiar icono y estado
  ventaCard.classList.add('expandida')
  if (chevron) {
    chevron.className = 'fas fa-chevron-up'
  }

  // Mostrar spinner mientras carga
  detalleExpandido.innerHTML = `
    <div class="detalle-loading">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      Cargando detalle...
    </div>
  `
  detalleExpandido.style.display = 'block'

  try {
    // Llamar a la API para obtener el detalle
    const response = await fetch(API_ROUTES.ventas.detalle(ventaId), {
      headers: tokenUtils.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener detalle de venta')
    }

    const detalleVenta = await response.json()
    renderizarDetalleVentaExpandido(detalleExpandido, detalleVenta)
  } catch (error) {
    console.error('❌ Error al cargar detalle de venta:', error)
    detalleExpandido.innerHTML = `
      <div class="alert alert-danger alert-sm">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Error al cargar el detalle. Inténtalo de nuevo.
      </div>
    `
  }
}

/**
 * Renderizar el detalle de venta expandido
 */
function renderizarDetalleVentaExpandido (contenedor, detalle) {
  const fecha = new Date(detalle.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const total = parseFloat(detalle.total || 0).toLocaleString('es-AR')

  // Generar HTML para los productos (versión compacta)
  const productosHTML = detalle.productos.map(producto => {
    const subtotalProducto = parseFloat(producto.subtotal).toLocaleString('es-AR')
    return `
      <div class="producto-detalle">
        <div class="producto-info">
          <strong>${producto.nombre}</strong>
          <small class="text-muted d-block">${producto.marca} | ${producto.categoria}</small>
        </div>
        <div class="producto-cantidad">
          ${producto.cantidad}x
        </div>
        <div class="producto-subtotal">
          $${subtotalProducto}
        </div>
      </div>
    `
  }).join('')

  contenedor.innerHTML = `
    <div class="detalle-venta-content">
      <div class="detalle-header">
        <div class="row">
          <div class="col-md-6">
            <small class="text-muted">Orden:</small>
            <code class="d-block">${detalle.numero_orden}</code>
          </div>
          <div class="col-md-6">
            <small class="text-muted">Fecha:</small>
            <span class="d-block">${fecha}</span>
          </div>
        </div>
      </div>

      <div class="detalle-productos">
        <h6 class="mb-2">
          <i class="fas fa-shopping-cart me-2"></i>
          Productos (${detalle.productos.length})
        </h6>
        <div class="productos-lista">
          ${productosHTML}
        </div>
      </div>

      <div class="detalle-total">
        <div class="d-flex justify-content-between align-items-center">
          <strong>Total:</strong>
          <strong class="text-success">$${total}</strong>
        </div>
      </div>
    </div>
  `
}
