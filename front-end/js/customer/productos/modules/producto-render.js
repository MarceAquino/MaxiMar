/**
 * MÓDULO: Renderizado de Productos
 *
 * Maneja la creación y renderizado de tarjetas de productos en la interfaz.
 *
 * FUNCIONALIDADES:
 * - Renderiza listas de productos en contenedores
 * - Crea tarjetas HTML individuales para cada producto
 * - Muestra mensajes cuando no hay productos
 * - Valida datos de productos antes de renderizar
 * - Maneja información de stock y precios
 *
 * DEPENDENCIAS:
 * - imagen-manager.js para manejo de imágenes
 */

import { crearHTMLImagenes, obtenerImagenesProducto } from './imagen-manager.js'

/**
 * Renderiza una lista de productos en el contenedor especificado
 * @param {Array} lista - Array de productos a renderizar
 * @param {HTMLElement} contenedor - Elemento DOM donde mostrar los productos
 */
export function renderizarListaProductos (lista, contenedor) {
  if (!contenedor) {
    return
  }

  // Limpiar contenido anterior
  contenedor.innerHTML = ''

  // Mostrar mensaje si no hay productos
  if (!lista.length) {
    mostrarMensajeSinProductos(contenedor)
    return
  }

  // Crear tarjeta para cada producto válido
  lista.forEach(producto => {
    if (esProductoValido(producto)) {
      const tarjeta = crearTarjetaProducto(producto)
      contenedor.appendChild(tarjeta)
    }
  })
}

/**
 * Muestra un mensaje cuando no se encuentran productos
 * @param {HTMLElement} contenedor - Contenedor donde mostrar el mensaje
 */
function mostrarMensajeSinProductos (contenedor) {
  contenedor.innerHTML = `
    <div class="col-12 text-center py-5">
      <i class="fas fa-search fa-3x text-muted mb-3"></i>
      <h3>No se encontraron productos</h3>
      <p class="text-muted">Intenta ajustar los filtros</p>
    </div>`
}

/**
 * Valida si un producto tiene los datos mínimos necesarios
 * @param {Object} producto - Producto a validar
 * @returns {boolean} - true si el producto es válido
 */
function esProductoValido (producto) {
  if (!producto.producto_id || !producto.nombre || !producto.precio) {
    return false
  }
  return true
}

/**
 * Crea una tarjeta HTML para mostrar un producto
 * @param {Object} producto - Datos del producto
 * @returns {HTMLElement} - Elemento div con la tarjeta del producto
 */
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

/**
 * Obtiene información formateada del stock de un producto
 * @param {Object} producto - Producto del cual obtener info de stock
 * @returns {Object} - Objeto con stock, clase CSS y texto a mostrar
 */
function obtenerInfoStock (producto) {
  const stock = producto.stock || 0
  return {
    stock,
    class: stock > 0 ? 'text-success' : 'text-danger',
    texto: stock > 0 ? stock : 'Sin stock'
  }
}
