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

    // Convertir campos numéricos de string a number
    if (datos.precio !== undefined) {
      datos.precio = parseFloat(datos.precio)
    }
    if (datos.stock !== undefined) {
      datos.stock = parseInt(datos.stock)
    }

    // NO procesar imágenes en actualización - solo se suben en creación

    // Parsear atributos_especificos si viene como string JSON
    if (datos.atributos_especificos && typeof datos.atributos_especificos === 'string') {
      try {
        datos.atributos_especificos = JSON.parse(datos.atributos_especificos)
      } catch (error) {
        console.log('❌ Error al parsear atributos_especificos:', error)
        return res.status(400).json({ ok: false, error: 'Los atributos específicos tienen formato inválido' })
      }
    }

    console.log('Datos recibidos para actualizar:', datos)

    // Validar datos antes de actualizar
    const validacion = validarProducto(datos, 'actualizar')
    if (!validacion.esValido) {
      console.log('❌ Errores de validación:', validacion.errores)
      return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: validacion.errores })
    }

    await Producto.update(datos, { where: { producto_id: req.params.id } })
    console.log('✅ Producto actualizado correctamente con ID:', req.params.id)
    res.json({ ok: true, mensaje: 'Producto actualizado' })
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error)
    res.status(500).json({ ok: false, error: 'Error al actualizar el producto' })
  }
}

module.exports = actualizarProducto
