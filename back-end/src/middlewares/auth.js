// Middleware para autenticar el token JWT de administradores.
// Verifica que el token esté presente, sea válido y que el administrador exista y esté activo.
// Si la autenticación es exitosa, agrega el admin al objeto req y continúa con la siguiente función.
// Si falla, responde con el error correspondiente.

const jwt = require('jsonwebtoken')
const { Admin } = require('../models')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Token de acceso requerido',
        error: 'NO_TOKEN'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Buscar el administrador correspondiente y verificar que esté activo
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
    console.error('Error en middleware de autenticación:', error)
    return res.status(401).json({
      message: 'Token inválido',
      error: 'INVALID_TOKEN'
    })
  }
}

module.exports = {
  authenticateToken
}
