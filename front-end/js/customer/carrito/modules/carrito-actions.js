// modules/carrito-actions.js - Acciones de manipulación del carrito
import {
  guardarCarrito,
  obtenerCarrito,
  setCarrito,
  verificarStock
} from './carrito-data.js'
import { actualizarContadorCarrito } from './carrito-ui.js'
import { mostrarMensajeCarrito, obtenerPaginaActual } from './carrito-utils.js'

// === AGREGAR PRODUCTOS ===
export function agregarAlCarrito (producto) {
  console.log('🛒 Intentando agregar producto al carrito:', producto.nombre)

  const id = producto.producto_id || producto.id
  const carrito = obtenerCarrito()

  // Verificar stock antes de agregar
  const verificacion = verificarStock(id, 1)

  if (!verificacion.disponible) {
    console.warn('⚠️ No se puede agregar al carrito:', verificacion.mensaje)
    mostrarMensajeCarrito(verificacion.mensaje, 'warning')
    return false
  }

  const existe = carrito.find(item => (item.producto_id || item.id) === id)

  if (existe) {
    existe.cantidad += 1
    console.log(`📈 Cantidad incrementada a ${existe.cantidad}`)
  } else {
    carrito.push({
      ...producto,
      producto_id: id,
      id,
      cantidad: 1
    })
    console.log('✅ Producto agregado como nuevo item')
  }

  // Guardar cambios
  setCarrito(carrito)
  guardarCarrito()
  actualizarContadorCarrito()

  // Si estamos en la página del carrito, re-renderizar
  if (obtenerPaginaActual() === 'carrito') {
    import('./carrito-ui.js').then(({ renderCarrito }) => renderCarrito())
  }

  return true
}

// === ELIMINAR PRODUCTOS ===
export function eliminarItemCarrito (id) {
  console.log('🗑️ Eliminando producto del carrito:', id)

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
    import('./carrito-ui.js').then(({ renderCarrito }) => renderCarrito())
  }
}

// === CAMBIAR CANTIDAD ===
export function cambiarCantidadCarrito (id, cambio) {
  console.log(`🔢 Cambiando cantidad del producto ${id} en ${cambio}`)

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
      import('./carrito-ui.js').then(({ renderCarrito }) => renderCarrito())
    }
  }
}

// === VACIAR CARRITO ===
export function vaciarCarrito () {
  console.log('🧹 Vaciando carrito completo...')

  setCarrito([])
  guardarCarrito()
  actualizarContadorCarrito()

  if (obtenerPaginaActual() === 'carrito') {
    import('./carrito-ui.js').then(({ renderCarrito }) => renderCarrito())
  }

  console.log('✅ Carrito vaciado')
}
