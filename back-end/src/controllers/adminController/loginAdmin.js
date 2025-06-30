/**
 * Controlador de login de administrador para MaxiMar Pet Store.
 * - Recibe email y password por body.
 * - Verifica que el admin exista y esté activo.
 * - Verifica la contraseña.
 * - Si es válido, responde con token y datos básicos del admin.
 * - Si no, responde con error simple.
 */
const { Admin } = require('../../models')
const { verificarPassword, generarTokenAdmin } = require('../../utils/authHelpers')
const { formatearRespuestaLoginAdmin, respuestaError } = require('../../utils/loginHelpers')

/**
 * Login de administrador. Devuelve token y datos si es válido.
 */
module.exports = async function loginAdmin (req, res) {
  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ where: { email, activo: true } })
    if (!admin) return res.status(401).json(respuestaError('Credenciales inválidas'))
    if (!await verificarPassword(password, admin.password)) {
      return res.status(401).json(respuestaError('Credenciales inválidas'))
    }
    res.json(formatearRespuestaLoginAdmin(admin, generarTokenAdmin(admin)))
  } catch {
    res.status(500).json(respuestaError('Error interno', 500))
  }
}
