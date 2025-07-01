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

    // Convertir campos numéricos de string a number (vienen como string desde FormData)
    if (datos.precio !== undefined) {
      datos.precio = parseFloat(datos.precio)
    }
    if (datos.stock !== undefined) {
      datos.stock = parseInt(datos.stock)
    }

    // Si hay imágenes, guardar los nombres de archivo como array
    if (req.files && req.files.length > 0) {
      datos.urls = req.files.map(f => f.filename)
    }

    console.log('📦 Datos recibidos para crear:', datos)

    // Validar datos antes de crear
    const validacion = validarProducto(datos, 'crear')
    if (!validacion.esValido) {
      console.log('❌ Errores de validación:', validacion.errores)
      return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: validacion.errores })
    }

    const producto = await Producto.create(datos)
    console.log('✅ Producto creado correctamente:', producto.producto_id)
    res.json({ ok: true, mensaje: 'Producto creado', producto })
  } catch (error) {
    console.error('❌ Error al crear producto:', error)
    res.status(500).json({ ok: false, error: 'Error al crear producto' })
  }
}

module.exports = crearProducto
