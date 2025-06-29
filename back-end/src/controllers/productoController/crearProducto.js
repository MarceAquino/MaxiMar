// ======================================================================
// Crear Producto
// ======================================================================
// Crea un nuevo producto en la base de datos y guarda los nombres de las imágenes subidas.

const { Producto } = require('../../models')

/**
 * Crea un nuevo producto (simple)
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 */
const crearProducto = async (req, res) => {
  try {
    const datos = { ...req.body }
    // Si hay imágenes, guardar los nombres de archivo
    if (req.files && req.files.length > 0) {
      datos.urls = JSON.stringify(req.files.map(f => f.filename))
    }
    const producto = await Producto.create(datos)
    res.json({ mensaje: 'Producto creado', producto })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear producto' })
  }
}

module.exports = crearProducto
