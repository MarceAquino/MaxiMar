/**
 * Gestor de productos del dashboard
 *
 * FUNCIONALIDADES:
 * - Obtención de la lista completa de productos desde la API.
 * - Almacenamiento y sincronización del estado global mediante `DashboardState`.
 * - Búsqueda y filtrado por texto, categoría, tipo de mascota y estado (activo/inactivo).
 * - Renderizado dinámico de tarjetas de producto con badges, precio, stock y acciones.
 * - Acciones sobre el producto (según permisos):
 *   · Modificar (administrador y superadministrador cuando el producto está activo).
 *   · Activar / Desactivar (solo superadministrador).
 *   · Eliminación permanente (solo superadministrador).
 * - Contador de productos actualmente mostrados.
 * - Manejo de errores y feedback visual al usuario.

* DEPENDENCIAS:
 * - API_ROUTES: Mapa de endpoints para la comunicación con la API.
 * - tokenUtils: Utilidades para obtención y decodificación de tokens JWT.
 * - DashboardState: Almacena y expone el estado (productos, filtros, usuario).
*/

import { API_ROUTES, tokenUtils } from '../../config/api.js'
import { DashboardState } from './dashboard-state.js'

/**
 * Carga todos los productos desde el servidor
 */
export async function cargarProductos () {
  try {
    const response = await fetch(API_ROUTES.productos)

    if (!response.ok) {
      throw new Error('Error al obtener productos')
    }

    const productos = await response.json()
    DashboardState.setProductos(productos)
    aplicarFiltros()
  } catch (error) {
    mostrarError('Error al cargar productos. Verifica tu conexión.')
  }
}

/**
 * Aplica filtros de búsqueda a los productos
 */
export function aplicarFiltros () {
  const textoBusqueda = document.getElementById('buscarProducto').value.toLowerCase()
  const categoriaFiltro = document.getElementById('filtroCategoria').value
  const mascotaFiltro = document.getElementById('filtroMascota').value
  const estadoFiltro = document.getElementById('filtroEstado').value

  if (!textoBusqueda && !categoriaFiltro && !mascotaFiltro && !estadoFiltro) {
    DashboardState.setProductosFiltrados(DashboardState.getProductos())
    renderizarProductos()
    actualizarContador()
    return
  }

  const productosFiltrados = DashboardState.getProductos().filter(producto => {
    const coincideTexto = producto.nombre.toLowerCase().includes(textoBusqueda) ||
                         producto.codigo.toLowerCase().includes(textoBusqueda)
    const coincideCategoria = !categoriaFiltro || producto.categoria === categoriaFiltro
    const coincideMascota = !mascotaFiltro || producto.tipo_mascota === mascotaFiltro
    const coincideEstado = !estadoFiltro || producto.activo.toString() === estadoFiltro

    return coincideTexto && coincideCategoria && coincideMascota && coincideEstado
  })

  DashboardState.setProductosFiltrados(productosFiltrados)
  renderizarProductos()
  actualizarContador()

  if (productosFiltrados.length === 0 && !textoBusqueda && !categoriaFiltro && !mascotaFiltro && !estadoFiltro) {
    DashboardState.setProductosFiltrados(DashboardState.getProductos())
    renderizarProductos()
    actualizarContador()
  }
}

/**
 * Renderiza los productos filtrados en el contenedor
 */
export function renderizarProductos () {
  const contenedor = document.getElementById('contenedorProductos')
  const mensajeSinProductos = document.getElementById('mensajeSinProductos')

  contenedor.innerHTML = ''
  contenedor.style.display = 'flex'

  if (DashboardState.getProductosFiltrados().length === 0) {
    mensajeSinProductos.style.display = 'block'
    contenedor.style.display = 'none'
    return
  }

  mensajeSinProductos.style.display = 'none'
  contenedor.style.display = 'flex'

  DashboardState.getProductosFiltrados().forEach(producto => {
    const tarjeta = crearTarjetaProducto(producto)
    contenedor.appendChild(tarjeta)
  })
}

/**
 * Crea una tarjeta HTML para mostrar un producto
 * @param {Object} producto - Datos del producto
 * @returns {HTMLElement} Elemento div con la tarjeta del producto
 */
export function crearTarjetaProducto (producto) {
  const div = document.createElement('div')
  div.className = 'col-lg-2-4 col-md-4 col-12'

  const stockClase = obtenerClaseStock(producto.stock)
  const categoriaClase = producto.categoria || 'alimento'
  const estadoClase = producto.activo ? '' : 'inactivo'
  const usuarioActual = DashboardState.getUsuarioActual()
  const esSuperAdmin = usuarioActual && usuarioActual.rol === 'superadmin'
  const puedeModificar = esSuperAdmin || producto.activo

  const botonesAccion = crearBotonesAccion(producto, esSuperAdmin, puedeModificar)

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

  agregarEventListenersProducto(div, producto)
  return div
}

/**
 * Crea los botones de acción para cada producto según permisos
 */
function crearBotonesAccion (producto, esSuperAdmin, puedeModificar) {
  let botones = ''

  if (puedeModificar) {
    botones += `
      <button class="btn btn-sm btn-outline-primary btn-modificar" data-id="${producto.producto_id}" title="Modificar">
        <i class="fas fa-edit"></i>
      </button>
    `
  }

  if (esSuperAdmin) {
    botones += `
      <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${producto.producto_id}" title="Eliminar">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm ${producto.activo ? 'btn-outline-warning' : 'btn-outline-success'} btn-toggle-estado"
              data-id="${producto.producto_id}"
              data-activo="${producto.activo}"
              title="${producto.activo ? 'Desactivar' : 'Activar'}">
        <i class="fas ${producto.activo ? 'fa-eye-slash' : 'fa-eye'}"></i>
      </button>
    `
  }

  return botones
}

/**
 * Determina la clase CSS según el nivel de stock
 */
function obtenerClaseStock (stock) {
  if (stock <= 5) return 'bajo'
  if (stock <= 20) return 'medio'
  return 'alto'
}

/**
 * Agrega event listeners a los botones de acción del producto
 */
function agregarEventListenersProducto (div, producto) {
  const btnModificar = div.querySelector('.btn-modificar')
  const btnEliminar = div.querySelector('.btn-eliminar')
  const btnToggleEstado = div.querySelector('.btn-toggle-estado')

  if (btnModificar) {
    btnModificar.addEventListener('click', () => {
      window.location.href = `/front-end/html/admin/modificarProducto.html?id=${producto.producto_id}`
    })
  }

  if (btnEliminar) {
    btnEliminar.addEventListener('click', () => {
      eliminarProducto(producto.producto_id, producto.nombre)
    })
  }

  if (btnToggleEstado) {
    btnToggleEstado.addEventListener('click', () => {
      toggleEstadoProducto(producto.producto_id, producto.activo, producto.nombre)
    })
  }
}

/**
 * Actualiza el contador de productos mostrados
 */
function actualizarContador () {
  const contador = document.getElementById('contadorProductos')
  const cantidad = DashboardState.getProductosFiltrados().length
  contador.textContent = `${cantidad} producto${cantidad !== 1 ? 's' : ''}`
}

/**
 * Muestra mensaje de error al usuario
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

/**
 * Cambia el estado activo/inactivo de un producto
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
      const mensaje = accionEspanol === 'activar' ? 'activado' : 'desactivado'
      alert(`Producto ${mensaje} exitosamente`)
      await cargarProductos()
    } else {
      alert(data.message || `Error al ${accionEspanol} el producto`)
    }
  } catch (error) {
    alert(`Error de conexión al ${accionEspanol} el producto`)
  }
}

/**
 * Elimina un producto permanentemente
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
        sessionStorage.clear()
        localStorage.clear()
        window.location.href = '/front-end/html/admin/loginAdmin.html'
        return
      }
      const errorText = await response.text()
      throw new Error(errorText || 'Error al eliminar producto')
    }

    alert('Producto eliminado correctamente')
    await cargarProductos()
  } catch (error) {
    alert(`Error al eliminar producto: ${error.message}`)
  }
}
