/**
 * Índice de controlador de producto.
 * Exporta todas las funciones de gestión de productos de forma modular.
 */

// ======================================================================
// Índice de Controlador de Producto
// ======================================================================

const crearProducto = require('./crearProducto')
const actualizarProducto = require('./actualizarProducto')
const borrarProducto = require('./borrarProducto')
const desactivarProducto = require('./desactivarProducto')
const activarProducto = require('./activarProducto')

module.exports = {
  crearProducto,
  actualizarProducto,
  borrarProducto,
  desactivarProducto,
  activarProducto
}
