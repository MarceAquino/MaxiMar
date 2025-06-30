/**
 * Crea una nueva venta.
 * Valida los items, crea la venta principal, procesa los detalles y responde con el número de orden.
 * Respuesta: { ok, mensaje, venta_id, numero_orden }
 */
const { Venta } = require('../../models')
const validarVenta = require('../../utils/validarVenta')
const procesarDetallesVenta = require('../../utils/procesarDetallesVenta')
const generarNumeroOrden = require('../../utils/generarNumeroOrden')

module.exports = async function crearVenta (req, res) {
  try {
    const { cliente, items } = req.body
    // Validar items y stock
    const validacion = await validarVenta(items)
    if (!validacion.esValido) {
      return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: validacion.errores })
    }
    // Crear venta principal
    const nuevaVenta = await Venta.create({
      cliente: cliente || 'Cliente Anónimo',
      subtotal: validacion.total,
      total: validacion.total
    })
    // Procesar detalles y stock
    await procesarDetallesVenta(nuevaVenta.venta_id, validacion.detallesVenta)
    // Generar número de orden
    const numeroOrden = generarNumeroOrden(nuevaVenta)
    // Respuesta uniforme y breve
    res.json({
      ok: true,
      mensaje: 'Venta exitosa',
      venta_id: nuevaVenta.venta_id,
      numero_orden: numeroOrden
    })
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error procesando la venta' })
  }
}
