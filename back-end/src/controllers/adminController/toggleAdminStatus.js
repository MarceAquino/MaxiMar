/**
 * Activa o desactiva un administrador (no superadmin).
 * Cambia el estado de activo y responde con el admin actualizado.
 */
const { Admin } = require('../../models')

module.exports = async function toggleAdminStatus (req, res) {
  try {
    const admin = await Admin.findByPk(req.params.id)
    if (!admin) {
      return res.status(404).json({ message: 'No encontrado' })
    }
    if (admin.rol === 'superadmin') {
      return res.status(400).json({ message: 'No se puede modificar el SuperAdmin' })
    }
    const activo = !admin.activo
    await Admin.update({ activo }, { where: { admin_id: admin.admin_id } })
    res.json({ message: activo ? 'Activado' : 'Desactivado', admin: { id: admin.admin_id, email: admin.email, nombre: admin.nombre, activo } })
  } catch {
    res.status(500).json({ message: 'Error al cambiar estado' })
  }
}
