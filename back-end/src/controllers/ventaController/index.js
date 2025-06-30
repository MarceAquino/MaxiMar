// Index de controladores de ventas para MaxiMar Pet Store
// Expone las funciones principales: crear, obtener una y obtener todas las ventas

const crearVenta = require('./crearVenta')
const obtenerVenta = require('./obtenerVenta')
const obtenerTodasLasVentas = require('./obtenerTodasLasVentas')

module.exports = {
  crearVenta,
  obtenerVenta,
  obtenerTodasLasVentas
}
