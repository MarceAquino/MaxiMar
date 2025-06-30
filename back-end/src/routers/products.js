// Rutas de productos para MaxiMar Pet Store
// Incluye endpoints públicos y protegidos para gestión de productos

const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const { authenticateToken } = require('../middlewares/auth')
const { requireRole } = require('../middlewares/roleAuth')
const validarStockMayorACero = require('../middlewares/validarStockMayorACero')
const {
  crearProducto,
  actualizarProducto,
  borrarProducto,
  desactivarProducto,
  activarProducto
} = require('../controllers/productoController')
const { getAllProducts, getProduct } = require('../controllers/customerController')

// Rutas públicas de productos
router.get('/products', getAllProducts) // Listar productos
router.get('/products/:id', getProduct) // Obtener producto por ID

// Rutas protegidas de productos
router.post('/products', authenticateToken, requireRole(['admin', 'superadmin']), upload.array('imagenes', 5), crearProducto) // Crear producto
router.put('/products/:id', authenticateToken, requireRole(['admin', 'superadmin']), upload.array('imagenes', 5), actualizarProducto) // Actualizar producto
router.delete('/products/:id', authenticateToken, requireRole(['superadmin']), borrarProducto) // Borrar producto

// Activar/desactivar productos (solo superadmin)
router.patch('/products/:id/activate', authenticateToken, requireRole(['superadmin']), validarStockMayorACero, activarProducto) // Activar producto
router.patch('/products/:id/deactivate', authenticateToken, requireRole(['superadmin']), desactivarProducto) // Desactivar producto

module.exports = router
