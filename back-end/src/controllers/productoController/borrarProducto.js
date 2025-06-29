// ======================================================================
// Borrar Producto
// ======================================================================
// Elimina un producto de la base de datos.

const { Producto } = require('../../models')

/**
 * Elimina un producto (simple)
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
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
