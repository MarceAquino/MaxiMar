/**
 * ACCIONES DEL CARRITO DE COMPRAS
 *
 * Módulo que contiene las operaciones principales para la gestión del carrito:
 * - Agregar productos
 * - Eliminar productos
 * - Modificar cantidades
 * - Vaciar carrito
 */

// Importación de dependencias para manejo de datos y UI
import {
  guardarCarrito,
  obtenerCarrito,
  setCarrito,
  verificarStock
} from './carrito-data.js'
import { actualizarContadorCarrito, renderCarrito } from './carrito-ui.js'
import { mostrarMensaje, obtenerPaginaActual } from './carrito-utils.js'

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe
 * @param {Object} producto - Objeto producto a agregar
 * @returns {boolean} - Resultado de la operación
 */
export function agregarAlCarrito (producto) {
  const id = producto.producto_id || producto.id
  const carrito = obtenerCarrito()

  // Verificar disponibilidad de stock
  const verificacion = verificarStock(id, 1)
  if (!verificacion.disponible) {
    mostrarMensaje(verificacion.mensaje, 'warning')
    return false
  }

  const productoExistente = carrito.find(item => (item.producto_id || item.id) === id)

  if (productoExistente) {
    productoExistente.cantidad += 1
  } else {
    carrito.push({
      ...producto,
      producto_id: id,
      id,
      cantidad: 1
    })
  }

  // Actualizar estado y UI
  setCarrito(carrito)
  guardarCarrito()
  actualizarContadorCarrito()

  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }

  return true
}

/**
 * Elimina completamente un producto del carrito
 * @param {number|string} id - ID del producto a eliminar
 */
export function eliminarItemCarrito (id) {
  const carrito = obtenerCarrito()
  const carritoSinItem = carrito.filter(item => (item.producto_id || item.id) !== id)
  actualizarCarritoCompleto(carritoSinItem)
}

/**
 * Modifica la cantidad de un producto en el carrito
 * @param {number|string} id - ID del producto
 * @param {number} cambio - Incremento o decremento de cantidad
 */
export function cambiarCantidadCarrito (id, cambio) {
  const carrito = obtenerCarrito()
  const item = carrito.find(item => (item.producto_id || item.id) === id)

  if (!item) return

  // Verificar stock disponible para incrementos
  if (cambio > 0) {
    const verificacion = verificarStock(id, cambio)
    if (!verificacion.disponible) {
      mostrarMensaje(verificacion.mensaje, 'warning')
      return
    }
  }

  item.cantidad += cambio

  if (item.cantidad < 1) {
    eliminarItemCarrito(id)
  } else {
    actualizarCarritoCompleto(carrito)
  }
}

/**
 * Vacía completamente el carrito
 */
export function vaciarCarrito () {
  actualizarCarritoCompleto([])
}

/**
 * Función auxiliar para actualizar el carrito y sincronizar la UI
 * @param {Array} nuevoCarrito - Estado actualizado del carrito
 */
function actualizarCarritoCompleto (nuevoCarrito) {
  setCarrito(nuevoCarrito)
  guardarCarrito()
  actualizarContadorCarrito()

  if (obtenerPaginaActual() === 'carrito') {
    renderCarrito()
  }
}
