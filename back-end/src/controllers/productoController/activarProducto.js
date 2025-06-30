// ======================================================================
// Activar Producto (solo activa, validación en middleware)
// ======================================================================

const { Producto } = require('../../models')

/**
 * Activa un producto (lo vuelve visible y vendible).
 * Respuesta: { ok, mensaje }
 */

// Activa un producto (el stock ya fue validado por el middleware)
const activarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id)
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' })
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
