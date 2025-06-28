const { Admin } = require('../models')

// Listar todos los administradores.
const listarAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['admin_id', 'email', 'nombre', 'rol', 'activo', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    res.json({
      message: 'Lista de administradores',
      admins
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al listar administradores' })
  }
}

// Desactivar/Activar administrador.
const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params
    const admin = await Admin.findByPk(id)

    if (!admin) {
      return res.status(404).json({
        message: 'Administrador no encontrado'
      })
    }

    if (admin.rol === 'superadmin') {
      return res.status(400).json({
        message: 'No se puede desactivar al Super Administrador',
        error: 'CANNOT_DEACTIVATE_SUPERADMIN'
      })
    }

    const nuevoEstado = !admin.activo
    await Admin.update(
      { activo: nuevoEstado },
      { where: { admin_id: id } }
    )

    res.json({
      message: `Administrador ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
      admin: {
        id: admin.admin_id,
        email: admin.email,
        nombre: admin.nombre,
        activo: nuevoEstado
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al cambiar estado del administrador' })
  }
}

// Eliminar administrador.
const eliminarAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const admin = await Admin.findByPk(id)

    if (!admin) {
      return res.status(404).json({
        message: 'Administrador no encontrado'
      })
    }

    if (admin.rol === 'superadmin') {
      return res.status(400).json({
        message: 'No se puede eliminar al Super Administrador',
        error: 'CANNOT_DELETE_SUPERADMIN'
      })
    }

    await Admin.destroy({ where: { admin_id: id } })

    res.json({
      message: 'Administrador eliminado correctamente'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar administrador' })
  }
}

module.exports = {
  listarAdmins,
  toggleAdminStatus,
  eliminarAdmin
}
