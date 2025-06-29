// ======================================================================
// Activar Producto (con validación de stock)
// ======================================================================
// Activa un producto solo si el stock es mayor a cero

const { Producto } = require('../../models')

/**
 * Activa un producto solo si el stock es mayor a cero
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 */
const activarProducto = async (req, res) => {
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
    await Producto.update(
      { activo: true },
      { where: { producto_id: req.params.id } }
    )
    res.json({ mensaje: 'Producto activado correctamente.' })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al activar el producto.' })
  }
}

module.exports = activarProducto
