// ======================================================================
// Middleware: Validar stock mayor a cero para activar producto
// ======================================================================
// Este middleware verifica que el producto tenga stock > 0 antes de permitir su activación.

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
