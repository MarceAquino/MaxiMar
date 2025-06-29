const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Admin } = require('../models')

// Registrar nuevo administrador (solo SuperAdmin puede registrar administradores)
const registrarAdmin = async (req, res) => {
  try {
    const { email, nombre, password } = req.body
    if (req.admin.rol !== 'superadmin') {
      return res.status(403).json({ message: 'Solo el SuperAdmin puede registrar administradores' })
    }
    const existe = await Admin.findOne({ where: { email } })
    if (existe) {
      return res.status(400).json({ message: 'Email ya registrado' })
    }
    const hashedPassword = await bcrypt.hash(password, 12)
    const nuevoAdmin = await Admin.create({ email, nombre, password: hashedPassword, rol: 'admin' })
    res.status(201).json({ message: 'Administrador registrado', admin: { id: nuevoAdmin.admin_id, email, nombre, rol: 'admin', activo: nuevoAdmin.activo } })
  } catch (error) {
    res.status(500).json({ message: 'Error interno', error: error.message })
  }
}

// Login de administrador
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ where: { email, activo: true } })
    if (!admin) return res.status(401).json({ message: 'Credenciales inválidas' })
    const ok = await bcrypt.compare(password, admin.password)
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' })
    const token = jwt.sign({ adminId: admin.admin_id, email: admin.email, nombre: admin.nombre, rol: admin.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    res.json({ message: 'Login exitoso', admin: { id: admin.admin_id, email: admin.email, nombre: admin.nombre, rol: admin.rol, activo: admin.activo }, token })
  } catch (error) {
    res.status(500).json({ message: 'Error interno', error: error.message })
  }
}

// Verificar token
const verificarToken = (req, res) => {
  res.json({ message: 'Token válido', admin: { id: req.admin.admin_id, email: req.admin.email, nombre: req.admin.nombre, activo: req.admin.activo } })
}

// Logout
const logoutAdmin = (req, res) => {
  res.json({ message: 'Logout exitoso. Token invalidado del lado del cliente.' })
}

module.exports = {
  registrarAdmin,
  loginAdmin,
  verificarToken,
  logoutAdmin
}
