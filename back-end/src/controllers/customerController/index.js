/*
 * Exporta los controladores de productos para clientes.
 * Incluye obtener todos los productos y obtener uno por ID.
 */

const getAllProducts = require('./getAllProducts')
const getProduct = require('./getProduct')

module.exports = {
  getAllProducts,
  getProduct
}
