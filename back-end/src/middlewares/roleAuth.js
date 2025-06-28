// Middleware para verificar que sea SuperAdmin
const requireSuperAdmin = async (req, res, next) => {
  try {
    // Este middleware se ejecuta después de authenticateToken
    if (!req.admin) {
      return res.status(401).json({
        message: 'Acceso no autorizado',
        error: 'NO_AUTH'
      })
    }

    if (req.admin.rol !== 'superadmin') {
      return res.status(403).json({
        message: 'Solo los Super Administradores pueden realizar esta acción',
        error: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    next()
  } catch (error) {
    console.error('Error en middleware de SuperAdmin:', error)
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    })
  }
}

// Middleware para verificar que sea Admin o SuperAdmin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        message: 'Acceso no autorizado',
        error: 'NO_AUTH'
      })
    }

    if (!['admin', 'superadmin'].includes(req.admin.rol)) {
      return res.status(403).json({
        message: 'Permisos insuficientes',
        error: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    next()
  } catch (error) {
    console.error('Error en middleware de Admin:', error)
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    })
  }
}

module.exports = {
  requireSuperAdmin,
  requireAdmin
}
