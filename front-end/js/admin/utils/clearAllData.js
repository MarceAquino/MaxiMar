// Limpia todos los datos de sesión y almacenamiento
export function clearAllData () {
  import('../config/api.js').then(({ tokenUtils }) => {
    tokenUtils.removeToken()
    localStorage.clear()
    sessionStorage.clear()
  })
}
