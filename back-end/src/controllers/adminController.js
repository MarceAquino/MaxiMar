const { Producto } = require('../models')
const { generateImageUrls } = require('../middlewares/upload')

const crearProducto = async (req, res) => {
  try {
    const productoData = { ...req.body }

    // Procesar las imágenes subidas
    if (req.files && req.files.length > 0) {
      const imageUrls = generateImageUrls(req.files)
      productoData.urls = JSON.stringify(imageUrls) // Convertir a JSON string
    } else {
      // Si no hay imágenes, usar imágenes por defecto (formato compatible)
      productoData.urls = JSON.stringify(['notFount.png'])
    }

    // Verificar si el stock es 0 y desactivar automáticamente
    if (productoData.stock === 0 || productoData.stock === '0') {
      productoData.activo = false
    }

    const nuevoProducto = await Producto.create(productoData)
    // Parsear las URLs para enviarlas en la respuesta
    const urlsParseadas = JSON.parse(productoData.urls)

    const respuesta = {
      message: 'Producto creado correctamente.',
      producto: nuevoProducto,
      warning: productoData.stock === 0 ? 'Producto desactivado automáticamente por stock 0' : null,
      images: urlsParseadas
    }
    res.json(respuesta)
  } catch (error) {
    console.error(error)
  }
}

const actualizarProducto = async (req, res) => {
  try {
    // Verificar que el producto existe
    const producto = await Producto.findByPk(req.params.id)
    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }
    // Si no es SuperAdmin, verificar que el producto esté activo
    if (req.admin.rol !== 'superadmin' && !producto.activo) {
      return res.status(403).json({
        message: 'Los productos desactivados solo pueden ser editados por el Super Administrador',
        error: 'PRODUCT_INACTIVE'
      })
    }

    const productoData = { ...req.body }
    let warning = null

    // Manejar subida de nuevas imágenes si existen
    if (req.files && req.files.length > 0) {
      // const { generateImageUrls } = require('../middlewares/upload')

      // Generar URLs de las nuevas imágenes
      const nuevasImagenes = generateImageUrls(req.files)

      // Combinar con imágenes existentes (si las hay)
      const imagenesExistentes = producto.urls ? JSON.parse(producto.urls) : []
      const todasLasImagenes = [...imagenesExistentes, ...nuevasImagenes]

      // Limitar a máximo 5 imágenes totales
      if (todasLasImagenes.length > 5) {
        productoData.urls = JSON.stringify(todasLasImagenes.slice(0, 5))
        warning = 'Se agregaron las nuevas imágenes. Total limitado a 5 imágenes máximo.'
      } else {
        productoData.urls = JSON.stringify(todasLasImagenes)
      }
    }

    // Verificar si el stock es 0 y desactivar automáticamente
    if (productoData.stock === 0 || productoData.stock === '0') {
      productoData.activo = false
      warning = warning ? `${warning} Producto desactivado automáticamente por stock 0.` : 'Producto desactivado automáticamente por stock 0'
    }

    await Producto.update(productoData, {
      where: { producto_id: req.params.id }
    })

    res.json({
      message: 'Producto actualizado correctamente.',
      warning
    })
  } catch (error) {
    console.log(error)
  }
}

// Solo SuperAdmin puede desactivar productos.
const desactivarProducto = async (req, res) => {
  try {
    // Verificar que el usuario sea SuperAdmin
    if (req.admin.rol !== 'superadmin') {
      return res.status(403).json({
        message: 'Solo el Super Administrador puede desactivar productos manualmente',
        error: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    await Producto.update(
      { activo: false },
      { where: { producto_id: req.params.id } }
    )

    res.json({
      message: 'Producto desactivado correctamente por el Super Administrador.'
    })
  } catch (error) {
    console.log(error)
  }
}

// Solo SuperAdmin puede activar productos
const activarProducto = async (req, res) => {
  try {
    // Verificar que el usuario sea SuperAdmin
    if (req.admin.rol !== 'superadmin') {
      return res.status(403).json({
        message: 'Solo el Super Administrador puede activar productos',
        error: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    // Verificar que el producto tenga stock antes de activar
    const producto = await Producto.findByPk(req.params.id)
    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    if (producto.stock === 0) {
      return res.status(400).json({
        message: 'No se puede activar un producto con stock 0. Actualice el stock primero.',
        error: 'ZERO_STOCK'
      })
    }

    await Producto.update(
      { activo: true },
      { where: { producto_id: req.params.id } }
    )

    res.json({
      message: 'Producto activado correctamente por el Super Administrador.'
    })
  } catch (error) {
    console.log(error)
  }
}

const borrarProducto = async (req, res) => {
  try {
    await Producto.destroy({
      where: { producto_id: req.params.id }
    })
    res.json('Registro eliminado correctamente.')
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  crearProducto,
  actualizarProducto,
  borrarProducto,
  desactivarProducto,
  activarProducto
}
