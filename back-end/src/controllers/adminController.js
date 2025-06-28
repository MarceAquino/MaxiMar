const { Producto } = require('../models')
const { generateImageUrls } = require('../middlewares/upload')

const crearProducto = async (req, res) => {
  try {
    // Copiamos todos los datos que vienen del formulario o frontend
    const productoData = { ...req.body }
    // Si se subieron archivos, generamos las URLs de las imágenes
    // Si no, usamos una imagen por defecto llamada 'notFount.png'
    if (req.files && req.files.length > 0) {
      const imageUrls = generateImageUrls(req.files)
      productoData.urls = JSON.stringify(imageUrls)
    } else {
      productoData.urls = JSON.stringify(['notFount.png'])
    }

    // Si el stock es 0, marcamos el producto como inactivo
    if (productoData.stock === 0 || productoData.stock === '0') {
      productoData.activo = false
    }
    // Guardamos el producto en la base de datos
    const nuevoProducto = await Producto.create(productoData)
    // Enviamos respuesta al frontend
    res.json({
      message: 'Producto creado correctamente.',
      producto: nuevoProducto
    })
  } catch (error) {
    // Si algo falla, mostramos el error en consola y avisamos al frontend
    console.error('❌ Error al crear producto:', error.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

const actualizarProducto = async (req, res) => {
  console.log('Llegó al PUT con ID:', req.params.id)
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
      const { generateImageUrls } = require('../middlewares/upload')

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

      console.log('📸 Nuevas imágenes agregadas:', nuevasImagenes)
      console.log('🖼️ Total de imágenes del producto:', todasLasImagenes)
    }

    // Verificar si el stock es 0 y desactivar automáticamente
    if (productoData.stock === 0 || productoData.stock === '0') {
      productoData.activo = false
      warning = warning ? `${warning} Producto desactivado automáticamente por stock 0.` : 'Producto desactivado automáticamente por stock 0'
      console.log('⚠️  Producto actualizado con stock 0, se desactiva automáticamente')
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
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: error.errors.map(err => ({
          campo: err.path,
          error: err.message
        }))
      })
    }
    res.status(500).json({ message: error.message })
  }
}

// Solo SuperAdmin puede desactivar productos manualmente
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
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
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: error.errors.map(err => ({
          campo: err.path,
          error: err.message
        }))
      })
    }
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  crearProducto,
  actualizarProducto,
  borrarProducto,
  desactivarProducto,
  activarProducto
}
