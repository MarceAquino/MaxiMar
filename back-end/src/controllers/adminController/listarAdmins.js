/**
 * Controlador para listar todos los administradores registrados.
 *
 * FUNCIONALIDADES:
 * - Obtiene lista completa de administradores
 * - Filtra password para que no se muestren
 * - Ordena por fecha de creación, default mas reciente primero
 * - El acceso es solo para superadmins
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
