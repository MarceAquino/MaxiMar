/**
 * Obtiene los detalles de una venta por ID.
 */
const { Venta, DetalleVenta, Producto } = require('../../models')
const { formatearVentaCompleta } = require('../../utils/formatearVenta')

module.exports = async function obtenerVenta (req, res) {
  try {
    const venta = await Venta.findByPk(req.params.id, {
      include: [{
        model: DetalleVenta,
        as: 'DetalleVentas',
        include: [{
          model: Producto,
          as: 'Producto',
          attributes: ['nombre', 'marca', 'categoria', 'tipo_mascota']
        }]
      }]
    })
    if (!venta) return res.status(404).json({ message: 'Venta no encontrada' })
    res.json(formatearVentaCompleta(venta))
  } catch {
    res.status(500).json({ message: 'Error al obtener la venta' })
  }
}
