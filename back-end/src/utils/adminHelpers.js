// Helpers para registro de administradores
const { Admin } = require('../models')
const bcrypt = require('bcrypt')

// Valida los datos para registrar un nuevo admin
function validarDatosAdmin ({ email, nombre, password }) {
  const errores = []
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errores.push('Email inválido')
  }
  if (!nombre || nombre.length < 2) {
    errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres')
  }
  if (!password || password.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres')
  }
  return errores
}

// Crea un nuevo admin con hash de password
async function crearNuevoAdmin ({ email, nombre, password }) {
  const hashedPassword = await bcrypt.hash(password, 12)
  return Admin.create({ email, nombre, password: hashedPassword, rol: 'admin' })
}

// Respuesta de éxito
function respuestaAdminRegistrado (admin) {
  const { admin_id: id, email, nombre, rol, activo } = admin
  return { ok: true, mensaje: 'Administrador registrado', admin: { id, email, nombre, rol, activo } }
}

// Respuesta de error
function respuestaErrorAdmin (mensaje, status = 400, detalles) {
  const res = { ok: false, error: mensaje }
  if (detalles) res.detalles = detalles
  res.status = status
  return res
}

module.exports = {
  validarDatosAdmin,
  crearNuevoAdmin,
  respuestaAdminRegistrado,
  respuestaErrorAdmin
}
