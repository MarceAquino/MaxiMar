// Controlador de ventas: crea y consulta ventas de forma simple y clara
const { Venta, DetalleVenta, Producto } = require('../models')

// Crear una nueva venta
const crearVenta = async (req, res) => {
  try {
    const { cliente, items } = req.body
    // Validar que haya productos en la venta
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No hay productos en la venta' })
    }

    let total = 0
    const detallesVenta = []

    // Recorrer cada producto del carrito
    for (const item of items) {
      const producto = await Producto.findByPk(item.producto_id)
      // Validar existencia, estado y stock suficiente
      if (!producto || !producto.activo || producto.stock < item.cantidad) {
        return res.status(400).json({ message: 'Producto no disponible o stock insuficiente' })
      }
      // Calcular subtotal y sumar al total
      const subtotal = producto.precio * item.cantidad
      total += subtotal
      // Guardar detalle para la venta
      detallesVenta.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
        subtotal
      })
    }

    // Crear la venta principal
    const nuevaVenta = await Venta.create({
      cliente: cliente || 'Cliente Anónimo',
      subtotal: total,
      total
    })

    // Crear los detalles de la venta y actualizar stock
    for (const detalle of detallesVenta) {
      await DetalleVenta.create({ venta_id: nuevaVenta.venta_id, ...detalle })
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

    // Generar número de orden simple
    const fecha = nuevaVenta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
    const numeroOrden = `PS-${fecha}-${nuevaVenta.venta_id.toString().padStart(3, '0')}`

    // Respuesta clara
    res.json({
      message: 'Venta exitosa',
      venta: {
        venta_id: nuevaVenta.venta_id,
        numero_orden: numeroOrden,
        cliente: nuevaVenta.cliente,
        fecha: nuevaVenta.createdAt,
        total: nuevaVenta.total,
        items: detallesVenta.length
      }
    })
  } catch {
    res.status(500).json({ message: 'Error procesando la venta' })
  }
}

// Obtener detalles de una venta por ID
const obtenerVenta = async (req, res) => {
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
    // Generar número de orden
    const fecha = venta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
    const numeroOrden = `PS-${fecha}-${venta.venta_id.toString().padStart(3, '0')}`
    // Respuesta clara con productos
    res.json({
      venta_id: venta.venta_id,
      numero_orden: numeroOrden,
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
    })
  } catch {
    res.status(500).json({ message: 'Error al obtener la venta' })
  }
}

// Listar todas las ventas (solo info principal)
const obtenerTodasLasVentas = async (req, res) => {
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
    // Formatear ventas para mostrar solo lo esencial
    const ventasFormateadas = ventas.map(venta => {
      const fecha = venta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
      const numeroOrden = `PS-${fecha}-${venta.venta_id.toString().padStart(3, '0')}`
      const cantidadProductos = venta.DetalleVentas.reduce((total, d) => total + d.cantidad, 0)
      return {
        venta_id: venta.venta_id,
        numero_orden: numeroOrden,
        nombre_cliente: venta.cliente,
        fecha_venta: venta.createdAt,
        total: venta.total,
        cantidad_productos: cantidadProductos
      }
    })
    res.json(ventasFormateadas)
  } catch {
    res.status(500).json({ message: 'Error al obtener las ventas' })
  }
}

// Exportar funciones
module.exports = {
  crearVenta,
  obtenerVenta,
  obtenerTodasLasVentas
}
