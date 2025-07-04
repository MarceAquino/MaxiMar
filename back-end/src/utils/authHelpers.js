// Helpers para autenticación de admin

/**
 * Compara una contraseña en texto plano con su hash almacenado.
 * Retorna true si coinciden, false si no.
 */
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function verificarPassword (passwordPlano, hash) {
  return await bcrypt.compare(passwordPlano, hash)
}

/**
 * Genera un token JWT para un admin autenticado.
 * Incluye datos básicos del admin y expiración.
 */
function generarTokenAdmin (admin) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado')
  }

  return jwt.sign(
    {
      adminId: admin.admin_id,
      email: admin.email,
      nombre: admin.nombre,
      rol: admin.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
}

module.exports = {
  verificarPassword,
  generarTokenAdmin
}
