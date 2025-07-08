/**
 * Middleware para validación de stock en activación de productos.
 *
 * FUNCIONALIDADES:
 * - Verifica existencia del producto
 * - Valida que el stock sea mayor a cero
 * - Impide la activación si stock es cero
 */

const { Producto } = require('../models')

/**
 * Middleware para validar que el producto tenga stock mayor a cero
 * Si el stock es 0, responde con error y no permite continuar
 */
const validarStockMayorACero = async (req, res, next) => {
  try {
    const producto = await Producto.findByPk(req.params.id)
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' })
    }
    if (producto.stock === 0) {
      return res.status(400).json({
        mensaje: 'No se puede activar un producto con stock 0. Actualice el stock primero.',
        error: 'STOCK_CERO'
      })
    }
    next()
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al validar el stock.' })
  }
}

module.exports = validarStockMayorACero
