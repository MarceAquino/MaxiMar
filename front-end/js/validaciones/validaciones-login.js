// ======================================================================
// VALIDACIONES PARA LOGIN DE ADMINISTRADORES
// ======================================================================
// Este archivo contiene las funciones de validación para el formulario de login

/**
 * Valida que el email tenga un formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido, false si no
 */
export function VALIDAR_EMAIL (email) {
  if (!email || email.trim() === '') {
    return false
  }

  // Expresión regular para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Valida que la contraseña cumpla con los requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si es válida, false si no
 */
export function VALIDAR_CLAVE (password) {
  if (!password || password.trim() === '') {
    return false
  }

  // Requisitos mínimos: al menos 6 caracteres
  return password.length >= 6
}
