/**
 * Controlador para verificación de tokens de autenticación.
 *
 * FUNCIONALIDADES:
 * - Valida tokens JWT de administradores
 * - Extrae y devuelve información básica del admin autenticado
 * - Confirma validez del token actual
 */

module.exports = function verificarToken (req, res) {
  const { admin_id: id, email, nombre, activo } = req.admin
  res.json({ message: 'Token válido', admin: { id, email, nombre, activo } })
}
