// Crea los detalles de venta y actualiza el stock de productos

/**
 * Crea los detalles de venta en la base de datos y descuenta stock de productos.
 * Si el stock llega a 0, desactiva el producto automáticamente.
 */
const { DetalleVenta, Producto } = require('../models')

async function procesarDetallesVenta (venta_id, detallesVenta) {
  for (const detalle of detallesVenta) {
    // Crear detalle de venta
    await DetalleVenta.create({ venta_id, ...detalle })
    // Descontar stock
    await Producto.update(
      { stock: Producto.sequelize.literal(`stock - ${detalle.cantidad}`) },
      { where: { producto_id: detalle.producto_id } }
    )
    // Si el stock llega a 0, desactivar producto
    const prod = await Producto.findByPk(detalle.producto_id)
    if (prod && prod.stock <= 0) {
      await Producto.update({ activo: 0 }, { where: { producto_id: detalle.producto_id } })
    }
  }
}

module.exports = procesarDetallesVenta
