/**
 * Controlador para eliminación de productos.
 *
 * FUNCIONALIDADES:
 * - Elimina permanentemente un producto de la base de datos
 * - Maneja errores durante el proceso de eliminación
 * - Proporciona confirmación de eliminación exitosa
 */

const { Producto } = require('../../models')

const borrarProducto = async (req, res) => {
  try {
    await Producto.destroy({ where: { producto_id: req.params.id } })
    res.json({ mensaje: 'Producto eliminado correctamente.' })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el producto.' })
  }
}

module.exports = borrarProducto
