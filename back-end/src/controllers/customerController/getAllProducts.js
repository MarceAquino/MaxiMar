// Obtiene todos los productos.

const { Producto } = require('../../models')

module.exports = async function getAllProducts (req, res) {
  try {
    const productos = await Producto.findAll()
    res.json(productos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
