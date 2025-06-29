const express = require('express')
const router = express.Router()

// Middleware de autenticación
const { authenticateToken } = require('../middlewares/auth.js')
const { requireRole } = require('../middlewares/roleAuth.js')
const validarStockMayorACero = require('../middlewares/validarStockMayorACero')
const { handleImageUpload, handleOptionalImageUpload } = require('../middlewares/upload.js')

// Funciones de customerControler
const {
  getAllProducts,
  getProduct
} = require('../controllers/customerController.js')

// Funciones de productoController
const {
  crearProducto,
  actualizarProducto,
  borrarProducto,
  desactivarProducto,
  activarProducto
} = require('../controllers/productoController')

// Funciones de superAdminController
const {
  listarAdmins,
  toggleAdminStatus
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
router.post('/auth/register', authenticateToken, requireRole(['superadmin']), registrarAdmin)

// Rutas de productos (Admin y SuperAdmin pueden crear/editar, solo SuperAdmin puede borrar)
router.post('/products', authenticateToken, requireRole(['admin', 'superadmin']), handleImageUpload, crearProducto)
router.put('/products/:id', authenticateToken, requireRole(['admin', 'superadmin']), handleOptionalImageUpload, actualizarProducto)
router.delete('/products/:id', authenticateToken, requireRole(['superadmin']), borrarProducto)

// Rutas de activación/desactivación manual (solo SuperAdmin)
router.patch('/products/:id/activate',
  authenticateToken,
  requireRole(['superadmin']),
  validarStockMayorACero,
  activarProducto
)
router.patch('/products/:id/deactivate', authenticateToken, requireRole(['superadmin']), desactivarProducto)

// Rutas de gestión de administradores (solo SuperAdmin)
router.get('/admin/list', authenticateToken, requireRole(['superadmin']), listarAdmins)
router.patch('/admin/:id/toggle', authenticateToken, requireRole(['superadmin']), toggleAdminStatus)

// Rutas de ventas (públicas)
router.post('/sales', crearVenta)
router.get('/sales/:id', obtenerVenta)
router.get('/sales', authenticateToken, requireRole(['admin', 'superadmin']), obtenerTodasLasVentas)

module.exports = router
