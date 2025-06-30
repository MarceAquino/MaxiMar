// Rutas de ventas para MaxiMar Pet Store
// Incluye creación de ventas, consulta individual y listado (protegido)

const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middlewares/auth')
const { requireRole } = require('../middlewares/roleAuth')
const {
  crearVenta,
  obtenerVenta,
  obtenerTodasLasVentas
} = require('../controllers/ventaController')

// Rutas de ventas
router.post('/sales', crearVenta) // Crear venta (pública)
router.get('/sales/:id', obtenerVenta) // Obtener venta por ID (pública)
router.get('/sales', authenticateToken, requireRole(['superadmin']), obtenerTodasLasVentas) // Listar todas las ventas (protegido)

module.exports = router
