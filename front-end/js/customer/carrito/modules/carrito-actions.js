// Acciones de manipulación del carrito
import {
  guardarCarrito,
  obtenerCarrito,
  setCarrito,
  verificarStock
} from './carrito-data.js'
import { actualizarContadorCarrito, renderCarrito } from './carrito-ui.js'
import { mostrarMensajeCarrito, obtenerPaginaActual } from './carrito-utils.js'

// === AGREGAR PRODUCTOS ===
export function agregarAlCarrito (producto) {
  const id = producto.producto_id || producto.id
  const carrito = obtenerCarrito()

  // Verificar stock antes de agregar
  const verificacion = verificarStock(id, 1)
  if (!verificacion.disponible) {
    mostrarMensajeCarrito(verificacion.mensaje, 'warning')
    return false
  }

  const existe = carrito.find(item => (item.producto_id || item.id) === id)
  if (existe) {
    existe.cantidad += 1
  } else {
    carrito.push({
      ...producto,
      producto_id: id,
      id,
      cantidad: 1
    })
  }

  // Guardar cambios
  setCarrito(carrito)
  guardarCarrito()
  actualizarContadorCarrito()

  // Si estamos en la página del carrito, re-renderizar
  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }
  return true
}

// === ELIMINAR PRODUCTOS ===
export function eliminarItemCarrito (id) {
  const carrito = obtenerCarrito()
  const productoAntes = carrito.find(item => (item.producto_id || item.id) === id)

  if (productoAntes) {
    console.log(`❌ Eliminando "${productoAntes.nombre}"`)
  }

  const carritoFiltrado = carrito.filter(item => (item.producto_id || item.id) !== id)

  // Guardar cambios
  setCarrito(carritoFiltrado)
  guardarCarrito()
  actualizarContadorCarrito()

  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }
}

// === CAMBIAR CANTIDAD ===
export function cambiarCantidadCarrito (id, cambio) {
  const carrito = obtenerCarrito()
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
    setCarrito(carrito)
    guardarCarrito()
    actualizarContadorCarrito()

    if (obtenerPaginaActual() === 'carrito') {
      renderCarrito()
    }
  }
}

// === VACIAR CARRITO ===
export function vaciarCarrito () {
  setCarrito([])
  guardarCarrito()
  actualizarContadorCarrito()

  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }
}
