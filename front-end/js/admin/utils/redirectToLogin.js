// Redirige al login si no estamos ya en el login o en proceso de submit
export function redirectToLogin () {
  const loginUrl = '/front-end/html/admin/login.html'
  if (window.location.pathname !== loginUrl && !window.procesoSubmitActivo) {
    window.location.replace(loginUrl)
  } else if (window.procesoSubmitActivo) {
    console.log('🛑 Redirección a login omitida - Proceso de submit activo')
    setTimeout(() => {
      if (!window.procesoSubmitActivo) {
        window.location.replace(loginUrl)
      }
    }, 6000)
  }
}
