// ======================================================================
// GESTOR DE PRODUCTOS DEL DASHBOARD
// ======================================================================
// Este módulo maneja todas las operaciones relacionadas con productos

import { API_ROUTES, tokenUtils } from '../../../config/api.js'
import { logout } from '../../auth-guard.js'
import { DashboardState } from './dashboard-state.js'

// ======================================================================
// CARGAR PRODUCTOS DESDE EL SERVIDOR
// ======================================================================
export async function cargarProductos () {
  console.log('📦 Cargando productos...')

  try {
    const response = await fetch(API_ROUTES.productos)

    if (!response.ok) {
      throw new Error('Error al obtener productos del servidor')
    }

    const productos = await response.json()
    console.log(`✅ ${productos.length} productos cargados`)

    DashboardState.setProductos(productos)
    aplicarFiltros()
  } catch (error) {
    console.error('❌ Error cargando productos:', error)
    mostrarError('Error al cargar productos. Verifica tu conexión.')
  }
}

// ======================================================================
// APLICAR FILTROS A LOS PRODUCTOS
// ======================================================================
export function aplicarFiltros () {
  // Obtener valores de los filtros
  const textoBusqueda = document.getElementById('buscarProducto').value.toLowerCase()
  const categoriaFiltro = document.getElementById('filtroCategoria').value
  const mascotaFiltro = document.getElementById('filtroMascota').value
  const estadoFiltro = document.getElementById('filtroEstado').value

  // Filtrar productos según criterios
  const productosFiltrados = DashboardState.getProductos().filter(producto => {
    // ¿El nombre o código coincide con la búsqueda?
    const coincideTexto = producto.nombre.toLowerCase().includes(textoBusqueda) ||
                         producto.codigo.toLowerCase().includes(textoBusqueda)

    // ¿La categoría coincide? (si no hay filtro, coincide todo)
    const coincideCategoria = !categoriaFiltro || producto.categoria === categoriaFiltro

    // ¿El tipo de mascota coincide?
    const coincideMascota = !mascotaFiltro || producto.tipo_mascota === mascotaFiltro

    // ¿El estado coincide?
    const coincideEstado = !estadoFiltro || producto.activo.toString() === estadoFiltro

    return coincideTexto && coincideCategoria && coincideMascota && coincideEstado
  })

  DashboardState.setProductosFiltrados(productosFiltrados)
  renderizarProductos()
  actualizarContador()
}

// ======================================================================
// MOSTRAR PRODUCTOS EN PANTALLA
// ======================================================================
export function renderizarProductos () {
  const contenedor = document.getElementById('contenedorProductos')
  const mensajeSinProductos = document.getElementById('mensajeSinProductos')
  const esVistaGrid = document.getElementById('vistaGrid').checked

  // Limpiar contenedor
  contenedor.innerHTML = ''

  // ¿No hay productos que mostrar?
  if (DashboardState.getProductosFiltrados().length === 0) {
    mensajeSinProductos.style.display = 'block'
    contenedor.style.display = 'none'
    return
  }

  // Mostrar productos
  mensajeSinProductos.style.display = 'none'
  contenedor.style.display = 'flex'

  // Configurar clases CSS según el tipo de vista
  contenedor.className = esVistaGrid ? 'row g-4' : 'vista-lista'

  // Crear tarjeta para cada producto
  DashboardState.getProductosFiltrados().forEach(producto => {
    const tarjeta = crearTarjetaProducto(producto, esVistaGrid)
    contenedor.appendChild(tarjeta)
  })
}

// ======================================================================
// CREAR TARJETA HTML PARA UN PRODUCTO
// ======================================================================
export function crearTarjetaProducto (producto, esVistaGrid) {
  const div = document.createElement('div')

  // Configurar clases CSS
  if (esVistaGrid) div.className = 'col-lg-4 col-md-6 col-sm-12'

  const stockClase = obtenerClaseStock(producto.stock)
  const categoriaClase = producto.categoria || 'alimento'
  const estadoClase = producto.activo ? '' : 'inactivo'

  // ¿El usuario puede activar/desactivar productos?
  const esSuperAdmin = DashboardState.getUsuarioActual() && DashboardState.getUsuarioActual().rol === 'superadmin'

  // ¿El usuario puede modificar este producto?
  const puedeModificar = esSuperAdmin || producto.activo

  // Botones según permisos
  const botonesAccion = `
    ${puedeModificar
? `
      <button class="btn btn-sm btn-outline-primary btn-modificar" data-id="${producto.producto_id}" title="Modificar">
        <i class="fas fa-edit"></i>
      </button>
    `
: ''}
    ${esSuperAdmin
? `
      <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${producto.producto_id}" title="Eliminar">
        <i class="fas fa-trash"></i>
      </button>
    `
: ''}
    ${esSuperAdmin
? `
      <button class="btn btn-sm ${producto.activo ? 'btn-outline-warning' : 'btn-outline-success'} btn-toggle-estado"
              data-id="${producto.producto_id}"
              data-activo="${producto.activo}"
              title="${producto.activo ? 'Desactivar' : 'Activar'}">
        <i class="fas ${producto.activo ? 'fa-eye-slash' : 'fa-eye'}"></i>
      </button>
    `
: ''}
  `

  // HTML de la tarjeta (vista grid)
  if (esVistaGrid) {
    div.innerHTML = `
      <div class="producto-card position-relative ${estadoClase}">
        <div class="producto-card-header">
          <div class="d-flex justify-content-between align-items-center">
            <span class="producto-badge ${categoriaClase}">
              <i class="fas ${categoriaClase === 'alimento' ? 'fa-bone' : 'fa-dice'}"></i>
              ${categoriaClase.charAt(0).toUpperCase() + categoriaClase.slice(1)}
            </span>
            <small class="text-muted">#${producto.codigo}</small>
          </div>
        </div>
        <div class="producto-card-body">
          <h6 class="card-title mb-2">${producto.nombre}</h6>
          <p class="text-muted mb-2">
            <i class="fas ${producto.tipo_mascota === 'perro' ? 'fa-dog' : 'fa-cat'} me-1"></i>
            ${producto.tipo_mascota.charAt(0).toUpperCase() + producto.tipo_mascota.slice(1)}
          </p>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="producto-precio">$${producto.precio.toLocaleString('es-AR')}</span>
            <span class="producto-stock ${stockClase}">
              <i class="fas fa-boxes me-1"></i>
              Stock: ${producto.stock}
            </span>
          </div>
          <small class="text-muted d-block mb-2">Marca: ${producto.marca}</small>
          <div class="producto-acciones">
            ${botonesAccion}
          </div>
        </div>
      </div>
    `
  } else {
    // HTML de la tarjeta (vista lista)
    div.innerHTML = `
      <div class="producto-card ${estadoClase}">
        <div class="producto-card-body">
          <div class="producto-info">
            <div>
              <h6 class="mb-1">${producto.nombre}</h6>
              <small class="text-muted">#${producto.codigo} | ${producto.marca}</small>
            </div>
          </div>
          <span class="producto-badge ${categoriaClase}">
            <i class="fas ${categoriaClase === 'alimento' ? 'fa-bone' : 'fa-dice'}"></i>
            ${categoriaClase}
          </span>
          <span class="producto-mascota text-muted">
            <i class="fas ${producto.tipo_mascota === 'perro' ? 'fa-dog' : 'fa-cat'} me-1"></i>
            ${producto.tipo_mascota}
          </span>
          <span class="producto-precio">$${producto.precio.toLocaleString('es-AR')}</span>
          <span class="producto-stock ${stockClase}">Stock: ${producto.stock}</span>
          <div class="producto-acciones">
            ${botonesAccion}
          </div>
        </div>
      </div>
    `
  }

  // Agregar funcionalidad a los botones
  agregarEventListenersProducto(div, producto)

  return div
}

// ======================================================================
// FUNCIONES AUXILIARES
// ======================================================================

/**
 * Determinar color del stock según cantidad
 */
function obtenerClaseStock (stock) {
  if (stock <= 5) return 'bajo' // Stock crítico (rojo)
  if (stock <= 20) return 'medio' // Stock medio (amarillo)
  return 'alto' // Stock alto (verde)
}

/**
 * Agregar eventos a los botones de cada producto
 */
function agregarEventListenersProducto (div, producto) {
  const btnModificar = div.querySelector('.btn-modificar')
  const btnEliminar = div.querySelector('.btn-eliminar')
  const btnToggleEstado = div.querySelector('.btn-toggle-estado')

  // Botón modificar - redirige a la página de edición
  if (btnModificar) {
    btnModificar.addEventListener('click', () => {
      window.location.href = `/front-end/html/admin/update.html?id=${producto.producto_id}`
    })
  }

  // Botón eliminar - elimina el producto
  if (btnEliminar) {
    btnEliminar.addEventListener('click', () => {
      eliminarProducto(producto.producto_id, producto.nombre)
    })
  }

  // Botón activar/desactivar (solo SuperAdmin)
  if (btnToggleEstado) {
    btnToggleEstado.addEventListener('click', () => {
      toggleEstadoProducto(producto.producto_id, producto.activo, producto.nombre)
    })
  }
}

/**
 * Actualizar contador de productos mostrados
 */
function actualizarContador () {
  const contador = document.getElementById('contadorProductos')
  const cantidad = DashboardState.getProductosFiltrados().length
  contador.textContent = `${cantidad} producto${cantidad !== 1 ? 's' : ''}`
}

/**
 * Mostrar mensaje de error al usuario
 */
function mostrarError (mensaje) {
  const contenedor = document.getElementById('contenedorProductos')
  contenedor.innerHTML = `
    <div class="col-12">
      <div class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${mensaje}
      </div>
    </div>
  `
}

// ======================================================================
// ACCIONES DE PRODUCTOS (SOLO PARA SUPER ADMIN)
// ======================================================================

/**
 * Alternar estado del producto (activar/desactivar)
 */
async function toggleEstadoProducto (productoId, estadoActual, nombreProducto) {
  const accionEspanol = estadoActual ? 'desactivar' : 'activar'
  const accionIngles = estadoActual ? 'deactivate' : 'activate'

  if (!confirm(`¿Está seguro que desea ${accionEspanol} el producto "${nombreProducto}"?`)) {
    return
  }

  try {
    const token = tokenUtils.getToken()
    const response = await fetch(`${API_ROUTES.productos}/${productoId}/${accionIngles}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (response.ok) {
      alert(`✅ Producto ${accionEspanol === 'activar' ? 'activado' : 'desactivado'} exitosamente`)
      await cargarProductos() // Recargar productos
    } else {
      alert(`❌ ${data.message || `Error al ${accionEspanol} el producto`}`)
    }
  } catch (error) {
    console.error(`❌ Error al ${accionEspanol} producto:`, error)
    alert(`❌ Error de conexión al ${accionEspanol} el producto`)
  }
}

/**
 * Eliminar producto permanentemente
 */
async function eliminarProducto (id, nombre) {
  if (!confirm(`¿Está seguro que desea eliminar el producto "${nombre}"?`)) {
    return
  }

  try {
    const response = await fetch(API_ROUTES.productoPorId(id), {
      method: 'DELETE',
      headers: {
        ...tokenUtils.getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        await logout()
        return
      }
      const errorText = await response.text()
      throw new Error(errorText || 'Error al eliminar producto')
    }

    alert('✅ Producto eliminado correctamente')
    await cargarProductos() // Recargar productos
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error)
    alert(`❌ Error al eliminar producto: ${error.message}`)
  }
}
