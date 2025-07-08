/**
 * Exporta todos los controladores relacionados con la gestión de administradores.
 *
 * FUNCIONALIDADES PRINCIPALES:
 * - Registro de nuevos administradores
 * - Autenticación de administradores
 * - Verificación de tokens de acceso
 * - Listado de administradores existentes
 * - Activación/desactivación de cuentas de administradores
 *
 * MÓDULOS INCLUIDOS:
 * - registrarAdmin: Maneja el registro de nuevos administradores
 * - loginAdmin: Gestiona el proceso de autenticación
 * - verificarToken: Valida tokens de acceso JWT
 * - listarAdmins: Obtiene lista de administradores registrados
 * - toggleAdminStatus: Activa/desactiva cuentas de administradores
 */

const registrarAdmin = require('./registrarAdmin')
const loginAdmin = require('./loginAdmin')
const verificarToken = require('./verificarToken')
const listarAdmins = require('./listarAdmins')
const toggleAdminStatus = require('./toggleAdminStatus')
const validarEmail = require('./validarEmail')
module.exports = {
  registrarAdmin,
  loginAdmin,
  verificarToken,
  listarAdmins,
  toggleAdminStatus,
  validarEmail
}
