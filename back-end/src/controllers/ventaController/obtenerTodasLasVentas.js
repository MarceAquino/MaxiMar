/**
 * Lista todas las ventas (solo info principal).
 */
const { Venta, DetalleVenta, Producto } = require('../../models')
const { formatearVentaResumen } = require('../../utils/formatearVenta')

module.exports = async function obtenerTodasLasVentas (req, res) {
  try {
    const ventas = await Venta.findAll({
      include: [{
        model: DetalleVenta,
        as: 'DetalleVentas',
        include: [{
          model: Producto,
          as: 'Producto',
          attributes: ['nombre', 'categoria']
        }]
      }],
      order: [['createdAt', 'DESC']]
    })
    const ventasFormateadas = ventas.map(formatearVentaResumen)
    res.json(ventasFormateadas)
  } catch {
    res.status(500).json({ message: 'Error al obtener las ventas' })
  }
}
