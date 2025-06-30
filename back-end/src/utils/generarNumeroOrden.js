// Genera el número de orden para una venta dado el objeto venta

/**
 * Genera un número de orden único para una venta en formato PS-YYYYMMDD-XXX.
 * Facilita la identificación y seguimiento de ventas.
 */
function generarNumeroOrden (venta) {
  const fecha = venta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
  return `PS-${fecha}-${venta.venta_id.toString().padStart(3, '0')}`
}

module.exports = generarNumeroOrden
