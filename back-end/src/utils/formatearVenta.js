// Helpers para formatear ventas (resumen y detalle)

/**
 * Genera un número de orden único para una venta.
 * El formato es PS-YYYYMMDD-XXX, donde XXX es el ID con ceros a la izquierda.
 * @returns {string} Número de orden generado.
 */
function generarNumeroOrden (venta) {
  const fecha = venta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
  return `PS-${fecha}-${venta.venta_id.toString().padStart(3, '0')}`
}

/**
 * Formatea una venta para el listado principal (resumen).
 * Devuelve los datos básicos de la venta y la cantidad total de productos.
 * @returns {object} Objeto resumen de la venta.
 */
function formatearVentaResumen (venta) {
  return {
    venta_id: venta.venta_id,
    numero_orden: generarNumeroOrden(venta),
    nombre_cliente: venta.cliente,
    fecha_venta: venta.createdAt,
    total: venta.total,
    cantidad_productos: venta.DetalleVentas.reduce((total, d) => total + d.cantidad, 0)
  }
}

/**
 * Formatea una venta con todos los detalles para la respuesta de obtenerVenta.
 * Incluye los productos vendidos y sus datos principales.
 * @returns {object} Objeto con el detalle completo de la venta.
 */
function formatearVentaCompleta (venta) {
  return {
    venta_id: venta.venta_id,
    numero_orden: generarNumeroOrden(venta),
    cliente: venta.cliente,
    fecha: venta.createdAt,
    total: venta.total,
    productos: venta.DetalleVentas.map(detalle => ({
      nombre: detalle.Producto.nombre,
      marca: detalle.Producto.marca,
      categoria: detalle.Producto.categoria,
      tipo_mascota: detalle.Producto.tipo_mascota,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
      subtotal: detalle.subtotal
    }))
  }
}

module.exports = {
  formatearVentaResumen,
  formatearVentaCompleta
}
