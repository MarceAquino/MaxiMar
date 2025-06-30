// ======================================================================
// Borrar Producto
// ======================================================================
// Elimina un producto de la base de datos.

const { Producto } = require('../../models')

/**
 * Borra un producto de la base de datos.
 * Respuesta: { ok, mensaje }
 */
const borrarProducto = async (req, res) => {
  try {
    await Producto.destroy({ where: { producto_id: req.params.id } })
    res.json({ mensaje: 'Producto eliminado correctamente.' })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el producto.' })
  }
}

module.exports = borrarProducto
