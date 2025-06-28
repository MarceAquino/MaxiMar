const express = require('express')
const router = express.Router()

// Middleware de autenticación
const { authenticateToken } = require('../middlewares/auth.js')
const { requireSuperAdmin, requireAdmin } = require('../middlewares/roleAuth.js')
const { handleImageUpload, handleOptionalImageUpload } = require('../middlewares/upload.js')

// Funciones de customerControler
const {
  getAllProducts,
  getProduct
} = require('../controllers/customerController.js')

// Funciones de adminControler
const {
  crearProducto,
  actualizarProducto,
  borrarProducto,
  desactivarProducto,
  activarProducto
} = require('../controllers/adminController.js')

// Funciones de superAdminController
const {
  listarAdmins,
  toggleAdminStatus,
  eliminarAdmin
} = require('../controllers/superAdminController.js')

// Funciones de ventaController
const {
  crearVenta,
  obtenerVenta,
  obtenerTodasLasVentas
} = require('../controllers/ventaController.js')

// Funciones de authController
const {
  registrarAdmin,
  loginAdmin,
  verificarToken,
  logoutAdmin
} = require('../controllers/authController.js')

// Rutas GET (publicas)
router.get('/products', getAllProducts)
router.get('/products/:id', getProduct)

// Rutas de autenticación
router.post('/auth/login', loginAdmin)
router.get('/auth/verify', authenticateToken, verificarToken)
router.post('/auth/logout', authenticateToken, logoutAdmin)

// Ruta de registro (solo SuperAdmin puede registrar otros admins)
router.post('/auth/register', authenticateToken, requireSuperAdmin, registrarAdmin)

// Rutas de productos (Admin y SuperAdmin pueden crear/editar, solo SuperAdmin puede borrar)
router.post('/products', authenticateToken, requireAdmin, handleImageUpload, crearProducto)
router.put('/products/:id', authenticateToken, requireAdmin, handleOptionalImageUpload, actualizarProducto)
router.delete('/products/:id', authenticateToken, requireSuperAdmin, borrarProducto)

// Rutas de activación/desactivación manual (solo SuperAdmin)
router.patch('/products/:id/activate', authenticateToken, requireSuperAdmin, activarProducto)
router.patch('/products/:id/deactivate', authenticateToken, requireSuperAdmin, desactivarProducto)

// Rutas de gestión de administradores (solo SuperAdmin)
router.get('/admin/list', authenticateToken, requireSuperAdmin, listarAdmins)
router.patch('/admin/:id/toggle', authenticateToken, requireSuperAdmin, toggleAdminStatus)
router.delete('/admin/:id', authenticateToken, requireSuperAdmin, eliminarAdmin)

// Rutas de ventas (públicas)
router.post('/sales', crearVenta)
router.get('/sales/:id', obtenerVenta)
router.get('/sales', authenticateToken, requireSuperAdmin, obtenerTodasLasVentas)

module.exports = router
