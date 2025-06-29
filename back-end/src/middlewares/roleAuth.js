// Middleware genérico para autorización de roles en rutas protegidas.
// Permite restringir el acceso a rutas según el rol del usuario autenticado.
// Uso:
//   const { requireRole } = require('./roleAuth')
//   router.post('/ruta', requireRole(['superadmin']), controlador)
//   router.get('/otra', requireRole(['admin', 'superadmin']), controlador)
//
// rolesPermitidos: Array de roles válidos para acceder a la ruta.
// El usuario debe estar autenticado y su rol debe estar incluido en rolesPermitidos.

const requireRole = (rolesPermitidos) => (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        message: 'Acceso no autorizado',
        error: 'NO_AUTH'
      })
    }

    if (!rolesPermitidos.includes(req.admin.rol)) {
      return res.status(403).json({
        message: rolesPermitidos.length === 1
          ? 'Solo los Super Administradores pueden realizar esta acción'
          : 'Permisos insuficientes',
        error: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    next()
  } catch (error) {
    console.error('Error en middleware de autorización de roles:', error)
  }
}

module.exports = {
  requireRole
}
