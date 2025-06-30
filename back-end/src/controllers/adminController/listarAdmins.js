/**
 * Lista todos los administradores (solo para superadmin).
 * Responde con un array de admins.
 */
const { Admin } = require('../../models')

module.exports = async function listarAdmins (req, res) {
  try {
    const admins = await Admin.findAll({
      attributes: ['admin_id', 'email', 'nombre', 'rol', 'activo'],
      order: [['createdAt', 'DESC']]
    })
    res.json({ admins })
  } catch {
    res.status(500).json({ message: 'Error al listar administradores' })
  }
}
