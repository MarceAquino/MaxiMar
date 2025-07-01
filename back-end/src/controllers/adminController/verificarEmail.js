/**
 * Verificar si un email está disponible para registro
 * Ruta: POST /auth/verificar-email
 */

const { Admin } = require('../../models')

/**
 * Controlador para verificar disponibilidad de email
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function verificarEmail (req, res) {
  try {
    const { email } = req.body

    // Validar que se proporcione el email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido',
        disponible: false
      })
    }

    // Buscar si ya existe un admin con este email
    const adminExistente = await Admin.findOne({
      where: {
        email: email.trim().toLowerCase()
      }
    })

    // Responder con disponibilidad
    return res.status(200).json({
      success: true,
      disponible: !adminExistente, // true si NO existe, false si existe
      message: adminExistente ? 'Email ya está en uso' : 'Email disponible'
    })
  } catch (error) {
    console.error('Error al verificar email:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      disponible: false
    })
  }
}

module.exports = verificarEmail
