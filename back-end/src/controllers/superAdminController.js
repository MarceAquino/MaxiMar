const { Admin } = require('../models')

// Listar administradores
const listarAdmins = async (req, res) => {
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

// Activar/desactivar admin (no superadmin)
const toggleAdminStatus = async (req, res) => {
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

module.exports = { listarAdmins, toggleAdminStatus }
