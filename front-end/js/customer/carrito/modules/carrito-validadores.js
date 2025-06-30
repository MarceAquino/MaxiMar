import { productosDisponibles } from './carrito-api.js'
import { carrito } from './carrito-manager.js'

export function verificarStock (productoId, cantidadDeseada) {
  const producto = obtenerProductoPorId(productoId)

  if (!producto) {
    return {
      disponible: false,
      stockActual: 0,
      mensaje: 'Producto no encontrado'
    }
  }

  if (!producto.activo) {
    return {
      disponible: false,
      stockActual: 0,
      mensaje: 'Producto no disponible'
    }
  }

  const itemEnCarrito = carrito.find(item => (item.producto_id || item.id) === productoId)
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0
  const cantidadTotal = cantidadEnCarrito + cantidadDeseada

  if (cantidadTotal > producto.stock) {
    return {
      disponible: false,
      stockActual: producto.stock,
      cantidadEnCarrito,
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, en carrito: ${cantidadEnCarrito}`
    }
  }

  return {
    disponible: true,
    stockActual: producto.stock,
    cantidadEnCarrito,
    mensaje: 'Stock disponible'
  }
}

function obtenerProductoPorId (id) {
  return productosDisponibles.find(p => p.producto_id === id) || null
}
