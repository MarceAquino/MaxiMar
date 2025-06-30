/**
 * Exporta todos los controladores relacionados a administradores y superadmin.
 * Incluye registro, login, verificación de token, logout y gestión de admins.
 */

const registrarAdmin = require('./registrarAdmin')
const loginAdmin = require('./loginAdmin')
const verificarToken = require('./verificarToken')
const logoutAdmin = require('./logoutAdmin')
const listarAdmins = require('./listarAdmins')
const toggleAdminStatus = require('./toggleAdminStatus')

module.exports = {
  registrarAdmin,
  loginAdmin,
  verificarToken,
  logoutAdmin,
  listarAdmins,
  toggleAdminStatus
}
