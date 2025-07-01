// Verifica el token y responde con los datos del admin autenticado.

// Verificar token de admin
module.exports = function verificarToken (req, res) {
  const { admin_id: id, email, nombre, activo } = req.admin
  res.json({ message: 'Token válido', admin: { id, email, nombre, activo } })
}
