// ======================================================================
// Desactivar Producto
// ======================================================================
// Desactiva un producto (cambia el campo activo a false)

const { Producto } = require('../../models')

/**
 * Desactiva un producto (no se muestra ni se puede vender).
 * Respuesta: { ok, mensaje }
 */
const desactivarProducto = async (req, res) => {
  try {
    await Producto.update(
      { activo: false },
      { where: { producto_id: req.params.id } }
    )
    res.json({ mensaje: 'Producto desactivado correctamente.' })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desactivar el producto.' })
  }
}

module.exports = desactivarProducto
