const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Admin } = require('../models')

// Registrar nuevo administrador (solo SuperAdmin puede hacer esto)
const registrarAdmin = async (req, res) => {
  try {
    const { email, nombre, password, rol = 'admin' } = req.body

    // Solo SuperAdmin puede registrar otros admins
    if (req.admin.rol !== 'superadmin') {
      return res.status(403).json({
        message: 'Solo el Super Administrador puede registrar nuevos administradores',
        error: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    // Validar que no se pueda crear otro superadmin
    if (rol === 'superadmin') {
      return res.status(400).json({
        message: 'No se puede crear otro Super Administrador',
        error: 'INVALID_ROLE'
      })
    }

    // Verificar si el email ya existe
    const adminExistente = await Admin.findOne({ where: { email } })
    if (adminExistente) {
      return res.status(400).json({
        message: 'Ya existe un administrador con este email',
        error: 'EMAIL_EXISTS'
      })
    }

    // Hashear la contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Crear el nuevo admin
    const nuevoAdmin = await Admin.create({
      email,
      nombre,
      password: hashedPassword,
      rol: 'admin' // Siempre crear como admin normal
    })

    res.status(201).json({
      message: 'Administrador registrado exitosamente',
      admin: {
        id: nuevoAdmin.admin_id,
        email: nuevoAdmin.email,
        nombre: nuevoAdmin.nombre,
        rol: nuevoAdmin.rol,
        activo: nuevoAdmin.activo,
        fecha_creacion: nuevoAdmin.fecha_creacion
      }
    })
  } catch (error) {
    console.error('Error en registro de admin:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: error.errors.map(err => ({
          campo: err.path,
          error: err.message
        }))
      })
    }
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    })
  }
}

// Login de administrador
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar admin por email
    const admin = await Admin.findOne({
      where: {
        email,
        activo: true
      }
    })

    if (!admin) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      })
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, admin.password)
    if (!passwordValida) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      })
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        adminId: admin.admin_id,
        email: admin.email,
        nombre: admin.nombre,
        rol: admin.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      message: 'Login exitoso',
      admin: {
        id: admin.admin_id,
        email: admin.email,
        nombre: admin.nombre,
        rol: admin.rol,
        activo: admin.activo
      },
      token
    })
  } catch (error) {
    console.error('Error en login de admin:', error)
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    })
  }
}

// Verificar token (para middleware o validación)
const verificarToken = (req, res) => {
  res.json({
    message: 'Token válido',
    admin: {
      id: req.admin.admin_id,
      email: req.admin.email,
      nombre: req.admin.nombre,
      activo: req.admin.activo
    }
  })
}

// Logout (invalidar token del lado del cliente)
const logoutAdmin = (req, res) => {
  res.json({
    message: 'Logout exitoso. Token invalidado del lado del cliente.'
  })
}

module.exports = {
  registrarAdmin,
  loginAdmin,
  verificarToken,
  logoutAdmin
}
