const { Venta, DetalleVenta, Producto } = require('../models')

// Crear una nueva venta
const crearVenta = async (req, res) => {
  try {
    const { cliente, items } = req.body

    // Validar que hay items
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: 'No se pueden procesar ventas sin productos',
        error: 'NO_ITEMS'
      })
    }

    // Calcular totales
    let subtotal = 0
    const detallesVenta = []

    // Validar productos y calcular totales
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

    const total = subtotal // Aquí podrías agregar descuentos, impuestos, etc.    // Crear la venta
    const nuevaVenta = await Venta.create({
      cliente: cliente || 'Cliente Anónimo',
      subtotal,
      total
    })

    // Crear los detalles de venta y actualizar stock
    for (const detalle of detallesVenta) {
      await DetalleVenta.create({
        venta_id: nuevaVenta.venta_id,
        ...detalle
      })

      // Actualizar stock del producto
      await Producto.update(
        { stock: Producto.sequelize.literal(`stock - ${detalle.cantidad}`) },
        { where: { producto_id: detalle.producto_id } }
      )

      // Verificar si el producto se quedó sin stock y desactivarlo
      const productoActualizado = await Producto.findByPk(detalle.producto_id)
      if (productoActualizado && productoActualizado.stock <= 0) {
        await Producto.update(
          { activo: 0 },
          { where: { producto_id: detalle.producto_id } }
        )
        console.log(`⚠️ Producto "${productoActualizado.nombre}" desactivado por falta de stock`)
      }
    }

    // Generar número de orden
    const fechaFormateada = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const numeroOrden = `PS-${fechaFormateada}-${nuevaVenta.venta_id.toString().padStart(3, '0')}`

    res.json({
      message: 'Venta procesada exitosamente',
      venta: {
        venta_id: nuevaVenta.venta_id,
        numero_orden: numeroOrden,
        cliente: nuevaVenta.cliente,
        fecha: nuevaVenta.fecha,
        subtotal: nuevaVenta.subtotal,
        total: nuevaVenta.total,
        items: detallesVenta.length
      }
    })
  } catch (error) {
    console.error('Error al procesar venta:', error)
    res.status(500).json({
      message: 'Error interno del servidor al procesar la venta',
      error: 'INTERNAL_ERROR'
    })
  }
}

// Obtener detalles de una venta
const obtenerVenta = async (req, res) => {
  try {
    const { id } = req.params
    console.log('🔍 Buscando venta con ID:', id)

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
      console.log('❌ Venta no encontrada:', id)
      return res.status(404).json({
        message: 'Venta no encontrada',
        error: 'SALE_NOT_FOUND'
      })
    }

    console.log('✅ Venta encontrada:', venta.venta_id)

    // Generar número de orden
    const fechaFormateada = venta.fecha.toISOString().slice(0, 10).replace(/-/g, '')
    const numeroOrden = `PS-${fechaFormateada}-${venta.venta_id.toString().padStart(3, '0')}`

    const response = {
      venta_id: venta.venta_id,
      numero_orden: numeroOrden,
      cliente: venta.cliente,
      fecha: venta.fecha,
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

    console.log('📋 Respuesta:', response)
    res.json(response)
  } catch (error) {
    console.error('❌ Error al obtener venta:', error)
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    })
  }
}

// Obtener todas las ventas (solo para SuperAdmin)
const obtenerTodasLasVentas = async (req, res) => {
  try {
    console.log('🔍 Obteniendo todas las ventas para SuperAdmin')

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
      order: [['fecha', 'DESC']]
    })

    console.log(`✅ ${ventas.length} ventas encontradas`)

    const ventasFormateadas = ventas.map(venta => {
      const fechaFormateada = venta.fecha.toISOString().slice(0, 10).replace(/-/g, '')
      const numeroOrden = `PS-${fechaFormateada}-${venta.venta_id.toString().padStart(3, '0')}`

      const cantidadProductos = venta.DetalleVentas.reduce((total, detalle) => {
        return total + detalle.cantidad
      }, 0)

      return {
        venta_id: venta.venta_id,
        numero_orden: numeroOrden,
        nombre_cliente: venta.cliente,
        fecha_venta: venta.fecha,
        total: venta.total,
        cantidad_productos: cantidadProductos
      }
    })

    res.json(ventasFormateadas)
  } catch (error) {
    console.error('❌ Error al obtener todas las ventas:', error)
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    })
  }
}

module.exports = {
  crearVenta,
  obtenerVenta,
  obtenerTodasLasVentas
}
