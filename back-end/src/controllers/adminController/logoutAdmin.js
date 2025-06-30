/**
 * Logout de administrador. Solo responde con un mensaje.
 */
module.exports = function logoutAdmin (req, res) {
  res.json({ message: 'Logout exitoso. Token invalidado del lado del cliente.' })
}
