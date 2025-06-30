/**
 * Controlador para registrar un nuevo administrador (solo SuperAdmin).
 * - Valida datos básicos.
 * - Solo permite registrar si el usuario es superadmin.
 * - Responde con el nuevo admin creado o error.
 */
const { Admin } = require('../../models')
const { validarDatosAdmin, crearNuevoAdmin, respuestaAdminRegistrado, respuestaErrorAdmin } = require('../../utils/adminHelpers')

module.exports = async function registrarAdmin (req, res) {
  try {
    const { email, nombre, password } = req.body
    if (req.admin.rol !== 'superadmin') {
      return res.status(403).json(respuestaErrorAdmin('Solo el SuperAdmin puede registrar administradores', 403))
    }
    const errores = validarDatosAdmin({ email, nombre, password })
    if (errores.length > 0) {
      return res.status(400).json(respuestaErrorAdmin('Datos inválidos', 400, errores))
    }
    const existe = await Admin.findOne({ where: { email } })
    if (existe) {
      return res.status(400).json(respuestaErrorAdmin('Email ya registrado', 400))
    }
    const nuevoAdmin = await crearNuevoAdmin({ email, nombre, password })
    res.status(201).json(respuestaAdminRegistrado(nuevoAdmin))
  } catch {
    res.status(500).json(respuestaErrorAdmin('Error interno', 500))
  }
}
