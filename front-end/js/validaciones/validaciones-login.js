export function VALIDAR_EMAIL (email) {
  if (!email || email.trim() === '') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function VALIDAR_CLAVE (password) {
  if (!password || password.trim() === '') {
    return false
  }

  return password.length >= 6
}
