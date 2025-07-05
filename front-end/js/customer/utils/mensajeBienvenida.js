/**
 * Muestra mensaje de bienvenida si hay usuario logueado
 */
export function mostrarMensajeBienvenida () {
  const mensajeBienvenida = document.getElementById('welcomeMessage')
  const usuarioGuardado = localStorage.getItem('nombreUsuario')

  if (mensajeBienvenida && usuarioGuardado) {
    mensajeBienvenida.textContent = `¡Hola, ${usuarioGuardado}!`
  }
}
