// Rutas de autenticación y gestión de administradores para MaxiMar Pet Store
// Incluye login, logout, verificación de token, registro y gestión de admins (solo superadmin)

const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middlewares/auth')
const { requireRole } = require('../middlewares/roleAuth')
const {
  registrarAdmin,
  loginAdmin,
  verificarToken,
  listarAdmins,
  toggleAdminStatus,
  validarEmail
} = require('../controllers/adminController')

// Rutas de autenticación
router.post('/auth/login', loginAdmin) // Login de admin
router.get('/auth/verify', authenticateToken, verificarToken) // Verifica si el token JWT es valido y a que admin pertenece.

// Validar si un email de admin ya existe (solo superadmin puede consultar)
router.get('/auth/validar-email', authenticateToken, requireRole(['superadmin']), validarEmail)

// Registro y gestión de administradores (solo superadmin)
router.post('/auth/register', authenticateToken, requireRole(['superadmin']), registrarAdmin) // Registrar admin
router.get('/admin/list', authenticateToken, requireRole(['superadmin']), listarAdmins) // Listar admins
router.patch('/admin/:id/toggle', authenticateToken, requireRole(['superadmin']), toggleAdminStatus) // Activar/desactivar admin

module.exports = router
