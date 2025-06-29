const { Producto } = require('../models')

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
    res.json(producto)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getAllProducts,
  getProduct
}
