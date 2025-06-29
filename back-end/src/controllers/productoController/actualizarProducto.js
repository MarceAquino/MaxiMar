// ======================================================================
// Actualizar Producto
// ======================================================================
// Actualiza los datos de un producto y, si hay imágenes, actualiza los nombres de archivo.

const { Producto } = require('../../models')

/**
 * Actualiza un producto (simple)
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 */
const actualizarProducto = async (req, res) => {
  try {
    const datos = { ...req.body }
    if (req.files && req.files.length > 0) {
      datos.urls = JSON.stringify(req.files.map(f => f.filename))
    }
    await Producto.update(datos, { where: { producto_id: req.params.id } })
    res.json({ mensaje: 'Producto actualizado correctamente.' })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el producto.' })
  }
}

module.exports = actualizarProducto
