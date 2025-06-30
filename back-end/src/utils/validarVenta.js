// Valida los items de una venta: existencia, stock y estado de productos

/**
 * Valida los productos de una venta, asegurando existencia, stock suficiente y estado activo.
 * Devuelve si la venta es válida, los errores encontrados y los detalles de la venta.
 */
const { Producto } = require('../models')

async function validarVenta (items) {
  const errores = []
  let total = 0
  const detallesVenta = []

  if (!Array.isArray(items) || items.length === 0) {
    errores.push('No hay productos en la venta')
    return { esValido: false, errores }
  }

  for (const item of items) {
    const producto = await Producto.findByPk(item.producto_id)
    if (!producto) {
      errores.push(`Producto con id ${item.producto_id} no existe`)
      continue
    }
    if (!producto.activo) {
      errores.push(`Producto ${producto.nombre} no está activo`)
      continue
    }
    if (producto.stock < item.cantidad) {
      errores.push(`Stock insuficiente para ${producto.nombre}`)
      continue
    }
    const subtotal = producto.precio * item.cantidad
    total += subtotal
    detallesVenta.push({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: producto.precio,
      subtotal
    })
  }

  return {
    esValido: errores.length === 0,
    errores,
    total,
    detallesVenta
  }
}

module.exports = validarVenta
