// ======================================================================
// Crear Producto
// ======================================================================
// Crea un nuevo producto en la base de datos y guarda los nombres de las imágenes subidas.
const validarProducto = require('../../utils/validarProducto.js')
const { Producto } = require('../../models')

/**
 * Crea un nuevo producto.
 * Valida los datos y guarda las imágenes si existen.
 * Respuesta: { ok, mensaje, producto }
 */
const crearProducto = async (req, res) => {
  try {
    const datos = { ...req.body }
    // Si hay imágenes, guardar los nombres de archivo como array
    if (req.files && req.files.length > 0) {
      datos.urls = req.files.map(f => f.filename)
    }
    // Validar datos antes de crear
    const validacion = validarProducto(datos, 'crear')
    if (!validacion.esValido) {
      return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: validacion.errores })
    }
    const producto = await Producto.create(datos)
    res.json({ ok: true, mensaje: 'Producto creado', producto })
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error al crear producto' })
  }
}

module.exports = crearProducto
