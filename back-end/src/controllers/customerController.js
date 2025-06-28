const { Producto } = require('../models')

function filtrarAtributos (producto) {
  const data = producto.toJSON()
  console.log('🔍 Datos del producto desde BD:', data)

  const tipoProducto = data.categoria
  let atributosEspecificos = data.atributos_especificos || {}

  console.log('📂 Tipo producto:', tipoProducto)
  console.log('🧩 Atributos específicos raw:', atributosEspecificos)
  console.log('🧩 Tipo de atributos específicos:', typeof atributosEspecificos)

  // Si viene como string, parsearlo
  if (typeof atributosEspecificos === 'string') {
    try {
      atributosEspecificos = JSON.parse(atributosEspecificos)
      console.log('✅ Atributos parseados desde string:', atributosEspecificos)
    } catch (error) {
      console.error('❌ Error al parsear atributos:', error)
      atributosEspecificos = {}
    }
  }

  const base = {
    ...data,
    tipoProducto, // renombramos para que el frontend reciba tipoProducto
    atributosEspecificos: {} // inicializamos en vacío y sobreescribimos abajo
  }

  if (tipoProducto === 'alimento') {
    base.atributosEspecificos = {
      edad: atributosEspecificos.edad || '',
      peso: atributosEspecificos.peso || '',
      sabor: atributosEspecificos.sabor || ''
    }
    console.log('🥫 Atributos de alimento procesados:', base.atributosEspecificos)
  } else if (tipoProducto === 'juguete') {
    base.atributosEspecificos = {
      tamano: atributosEspecificos.tamano || atributosEspecificos.tamaño || '',
      material: atributosEspecificos.material || ''
    }
    console.log('🧸 Atributos de juguete procesados:', base.atributosEspecificos)
  }

  console.log('📦 Producto final enviado al frontend:', base)
  return base
}

const getAllProducts = async (req, res) => {
  try {
    const productos = await Producto.findAll()
    res.json(productos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getProduct = async (req, res) => {
  try {
    const { id } = req.params
    const producto = await Producto.findByPk(id)

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    console.log('Producto original:', producto.toJSON())
    const productoFiltrado = filtrarAtributos(producto)
    res.json(productoFiltrado)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getAllProducts,
  getProduct
}
