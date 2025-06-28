const { Venta, DetalleVenta, Producto } = require('../models')

// Crear una nueva venta
const crearVenta = async (req, res) => {
  try {
    const { cliente, items } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: 'No se pueden procesar ventas sin productos',
        error: 'NO_ITEMS'
      })
    }

    let subtotal = 0
    const detallesVenta = []

    for (const item of items) {
      const producto = await Producto.findByPk(item.producto_id)

      if (!producto) {
        return res.status(400).json({
          message: `Producto con ID ${item.producto_id} no encontrado`,
          error: 'PRODUCT_NOT_FOUND'
        })
      }

      if (!producto.activo) {
        return res.status(400).json({
          message: `El producto "${producto.nombre}" no está disponible`,
          error: 'PRODUCT_INACTIVE'
        })
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente para "${producto.nombre}". Stock disponible: ${producto.stock}`,
          error: 'INSUFFICIENT_STOCK'
        })
      }

      const subtotalItem = producto.precio * item.cantidad
      subtotal += subtotalItem

      detallesVenta.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
        subtotal: subtotalItem
      })
    }

    const total = subtotal
    const nuevaVenta = await Venta.create({
      cliente: cliente || 'Cliente Anónimo',
      subtotal,
      total
    })

    for (const detalle of detallesVenta) {
      await DetalleVenta.create({
        venta_id: nuevaVenta.venta_id,
        ...detalle
      })

      await Producto.update(
        { stock: Producto.sequelize.literal(`stock - ${detalle.cantidad}`) },
        { where: { producto_id: detalle.producto_id } }
      )

      const productoActualizado = await Producto.findByPk(detalle.producto_id)
      if (productoActualizado && productoActualizado.stock <= 0) {
        await Producto.update(
          { activo: 0 },
          { where: { producto_id: detalle.producto_id } }
        )
      }
    }

    // Usar createdAt para la fecha
    const fechaFormateada = nuevaVenta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
    const numeroOrden = `PS-${fechaFormateada}-${nuevaVenta.venta_id.toString().padStart(3, '0')}`

    res.json({
      message: 'Venta procesada exitosamente',
      venta: {
        venta_id: nuevaVenta.venta_id,
        numero_orden: numeroOrden,
        cliente: nuevaVenta.cliente,
        fecha: nuevaVenta.createdAt,
        subtotal: nuevaVenta.subtotal,
        total: nuevaVenta.total,
        items: detallesVenta.length
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error procesando la venta' })
  }
}

// Obtener detalles de una venta
const obtenerVenta = async (req, res) => {
  try {
    const { id } = req.params

    const venta = await Venta.findByPk(id, {
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

    if (!venta) {
      return res.status(404).json({
        message: 'Venta no encontrada',
        error: 'SALE_NOT_FOUND'
      })
    }

    const fechaFormateada = venta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
    const numeroOrden = `PS-${fechaFormateada}-${venta.venta_id.toString().padStart(3, '0')}`

    const response = {
      venta_id: venta.venta_id,
      numero_orden: numeroOrden,
      cliente: venta.cliente,
      fecha: venta.createdAt,
      subtotal: venta.subtotal,
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
    res.json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener la venta' })
  }
}

// Obtener todas las ventas.
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
      order: [['createdAt', 'DESC']] // Cambié fecha por createdAt
    })

    const ventasFormateadas = ventas.map(venta => {
      const fechaFormateada = venta.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
      const numeroOrden = `PS-${fechaFormateada}-${venta.venta_id.toString().padStart(3, '0')}`

      const cantidadProductos = venta.DetalleVentas.reduce((total, detalle) => total + detalle.cantidad, 0)

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
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener las ventas' })
  }
}

module.exports = {
  crearVenta,
  obtenerVenta,
  obtenerTodasLasVentas
}
