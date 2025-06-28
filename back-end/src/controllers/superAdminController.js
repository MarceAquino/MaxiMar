const { Admin } = require('../models')

// Listar todos los administradores (solo SuperAdmin)
const listarAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['admin_id', 'email', 'nombre', 'rol', 'activo', 'fecha_creacion'],
      order: [['fecha_creacion', 'DESC']]
    })

    res.json({
      message: 'Lista de administradores',
      admins
    })
  } catch (error) {
    console.error('Error al listar administradores:', error)
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    })
  }
}

// Desactivar/Activar administrador (solo SuperAdmin)
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
    console.error('Error al cambiar estado del administrador:', error)
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    })
  }
}

// Eliminar administrador (solo SuperAdmin)
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
    console.error('Error al eliminar administrador:', error)
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    })
  }
}

module.exports = {
  listarAdmins,
  toggleAdminStatus,
  eliminarAdmin
}
