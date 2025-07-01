import { crearHTMLImagenes, obtenerImagenesProducto } from './imagen-manager.js'

// Función principal para renderizar lista de productos
export function renderizarListaProductos (lista, contenedor) {
  if (!contenedor) {
    console.warn('Contenedor de productos no encontrado')
    return
  }

  contenedor.innerHTML = ''

  if (!lista.length) {
    mostrarMensajeSinProductos(contenedor)
    return
  }

  lista.forEach(producto => {
    if (esProductoValido(producto)) {
      const tarjeta = crearTarjetaProducto(producto)
      contenedor.appendChild(tarjeta)
    }
  })
}

// Función para mostrar mensaje cuando no hay productos
function mostrarMensajeSinProductos (contenedor) {
  contenedor.innerHTML = `
    <div class="col-12 text-center py-5">
      <i class="fas fa-search fa-3x text-muted mb-3"></i>
      <h3>No se encontraron productos</h3>
      <p class="text-muted">Intenta ajustar los filtros</p>
    </div>`
}

// Función para validar si un producto tiene los datos mínimos
function esProductoValido (producto) {
  if (!producto.producto_id || !producto.nombre || !producto.precio) {
    console.warn('Producto con datos incompletos:', producto)
    return false
  }
  return true
}

// Función para crear tarjeta de producto
export function crearTarjetaProducto (producto) {
  const col = document.createElement('div')
  col.className = 'col-12 col-lg-3'

  const stockInfo = obtenerInfoStock(producto)
  const imagenes = obtenerImagenesProducto(producto)
  const containerId = `img-container-${producto.producto_id}`
  const imageHTML = crearHTMLImagenes(imagenes, containerId, producto.nombre)

  col.innerHTML = `
    <div class="card h-100 shadow-sm product-card">
      ${imageHTML}
      <div class="card-body card-body-compact d-flex flex-column">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="card-text text-muted small">
          <span class="text-bold">Marca:</span> ${producto.marca || 'Sin marca'}
        </p>
        <p class="card-text ${stockInfo.class} small">
          <span class="text-bold">Stock:</span> ${stockInfo.texto}
        </p>
        <div class="mt-auto">
          <div class="price-section">
            <p class="card-text fs-5 fw-bold price-orange mb-2">
              $${producto.precio.toLocaleString('es-AR')}
            </p>
          </div>
          <button class="btn btn-add-cart w-100 agregarCarrito"
                  data-id="${producto.producto_id}"
                  ${stockInfo.stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart me-2"></i>
            ${stockInfo.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>`

  return col
}

// Función auxiliar para obtener información del stock
function obtenerInfoStock (producto) {
  const stock = producto.stock || 0
  return {
    stock,
    class: stock > 0 ? 'text-success' : 'text-danger',
    texto: stock > 0 ? stock : 'Sin stock'
  }
}
