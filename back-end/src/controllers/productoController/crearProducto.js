/**
 * Controlador para creación de nuevos productos.
 *
 * FUNCIONALIDADES:
 * - Crea nuevos productos en la base de datos
 * - Valida datos de entrada antes de crear
 * - Maneja carga de imágenes asociadas
 * - Convierte y parsea tipos de datos
 * - Gestiona errores específicos de validación y duplicados
 */

const validarProducto = require('../../utils/validarProducto.js')
const { Producto } = require('../../models')

// Creacion de producto
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

    // Si hay imágenes, guardar las rutas completas como array
    if (req.files && req.files.length > 0) {
      datos.urls = req.files.map(f => `/front-end/img/nuevos-Producto/${f.filename}`)
    }

    // Parsear atributos_especificos si viene como string JSON
    if (datos.atributos_especificos && typeof datos.atributos_especificos === 'string') {
      try {
        datos.atributos_especificos = JSON.parse(datos.atributos_especificos)
      } catch (error) {
        return res.status(400).json({ ok: false, error: 'Los atributos específicos tienen formato inválido' })
      }
    }

    console.log('Datos recibidos para crear:', datos)

    // Validar datos antes de crear
    const validacion = validarProducto(datos, 'crear')
    if (!validacion.esValido) {
      return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: validacion.errores })
    }

    const producto = await Producto.create(datos)
    res.json({ ok: true, mensaje: 'Producto creado', producto })
  } catch (error) {
    // Manejar error de código duplicado
    if (error.name === 'SequelizeUniqueConstraintError' && error.fields && error.fields.codigo) {
      return res.status(400).json({
        ok: false,
        error: 'Ya existe un producto con ese código',
        detalles: [`El código "${error.fields.codigo}" ya está en uso. Use un código diferente.`]
      })
    }

    // Otros errores de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(err => err.message)
      return res.status(400).json({
        ok: false,
        error: 'Datos inválidos',
        detalles: errores
      })
    }

    // Error genérico
    res.status(500).json({ ok: false, error: 'Error al crear producto' })
  }
}

module.exports = crearProducto
