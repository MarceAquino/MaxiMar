// ======================================================================
// Índice de Controlador de Producto
// ======================================================================
// Exporta todas las funciones del controlador de producto de forma modular.

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
