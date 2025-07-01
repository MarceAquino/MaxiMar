// Obtiene un producto por ID.

const { Producto } = require('../../models')

module.exports = async function getProduct (req, res) {
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
