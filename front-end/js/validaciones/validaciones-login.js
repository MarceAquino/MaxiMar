export function VALIDAR_EMAIL (email) {
  if (!email || email.trim() === '') {
    return false
  }

  // Expresión regular para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function VALIDAR_CLAVE (password) {
  if (!password || password.trim() === '') {
    return false
  }

  // Requisitos mínimos: al menos 6 caracteres
  return password.length >= 6
}
