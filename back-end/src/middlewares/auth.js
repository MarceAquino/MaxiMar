const jwt = require('jsonwebtoken')
const { Admin } = require('../models')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: 'Token de acceso requerido',
        error: 'NO_TOKEN'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar que el admin aún existe y está activo
    const admin = await Admin.findOne({
      where: {
        admin_id: decoded.adminId,
        activo: true
      }
    })

    if (!admin) {
      return res.status(401).json({
        message: 'Token inválido o administrador inactivo',
        error: 'INVALID_TOKEN'
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token inválido',
        error: 'INVALID_TOKEN'
      })
    }

    console.error('Error en middleware de autenticación:', error)
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    })
  }
}

module.exports = {
  authenticateToken
}
