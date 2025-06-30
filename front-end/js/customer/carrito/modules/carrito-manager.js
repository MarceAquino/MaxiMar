import { actualizarContadorCarrito } from './carrito-render.js'
import { cargarCarrito, guardarCarrito } from './carrito-storage.js'
import { verificarStock } from './carrito-validadores.js'

let carrito = []

export function inicializarCarrito () {
  cargarCarrito()
  actualizarContadorCarrito()
}

export function agregarAlCarrito (producto) {
  const id = producto.producto_id || producto.id
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

  guardarCarrito()
  actualizarContadorCarrito()
  return true
}

export function eliminarItemCarrito (id) {
  carrito = carrito.filter(item => (item.producto_id || item.id) !== id)
  guardarCarrito()
  actualizarContadorCarrito()
}

export function cambiarCantidadCarrito (id, cambio) {
  const item = carrito.find(item => (item.producto_id || item.id) === id)
  if (!item) return

  if (cambio > 0) {
    const verificacion = verificarStock(id, cambio)
    if (!verificacion.disponible) {
      mostrarMensajeCarrito(verificacion.mensaje, 'warning')
      return
    }
  }

  item.cantidad += cambio
  if (item.cantidad < 1) {
    eliminarItemCarrito(id)
  } else {
    guardarCarrito()
    actualizarContadorCarrito()
  }
}

export function vaciarCarrito () {
  carrito = []
  guardarCarrito()
  actualizarContadorCarrito()
}

export function obtenerCarritoActual () {
  return carrito
}

// Función auxiliar local
function mostrarMensajeCarrito (mensaje, tipo = 'info') {
  console.log(`💬 Mensaje carrito: ${mensaje} (${tipo})`)
  // Implementación de mostrar mensaje...
}
