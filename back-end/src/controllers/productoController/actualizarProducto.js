// ======================================================================
// Actualizar Producto
// ======================================================================
// Actualiza los datos de un producto y, si hay imágenes, actualiza los nombres de archivo.
const validarProducto = require('../../utils/validarProducto.js')
const { Producto } = require('../../models')

/**
 * Actualiza un producto existente.
 * Valida los datos y permite actualizar imágenes si se envían.
 * Respuesta: { ok, mensaje }
 */
const actualizarProducto = async (req, res) => {
  try {
    const datos = { ...req.body }
    if (req.files && req.files.length > 0) {
      datos.urls = JSON.stringify(req.files.map(f => f.filename))
    }
    // Validar datos antes de actualizar
    const validacion = validarProducto(datos, 'actualizar')
    if (!validacion.esValido) {
      return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: validacion.errores })
    }
    await Producto.update(datos, { where: { producto_id: req.params.id } })
    res.json({ ok: true, mensaje: 'Producto actualizado' })
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error al actualizar el producto' })
  }
}

module.exports = actualizarProducto
