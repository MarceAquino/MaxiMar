const { Producto } = require('../models')

function filtrarAtributos (producto) {
  const data = producto.toJSON()

  const tipoProducto = data.categoria
  let atributosEspecificos = data.atributos_especificos || {}

  // Si viene como string, parsearlo
  if (typeof atributosEspecificos === 'string') {
    try {
      atributosEspecificos = JSON.parse(atributosEspecificos)
    } catch (error) {
      console.error(error)
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
  } else if (tipoProducto === 'juguete') {
    base.atributosEspecificos = {
      tamano: atributosEspecificos.tamano || atributosEspecificos.tamaño || '',
      material: atributosEspecificos.material || ''
    }
  }
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
