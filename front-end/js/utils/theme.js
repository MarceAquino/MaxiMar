/**
 * GESTOR DE TEMA CLARO/OSCURO
 *
 * FUNCIONALIDADES:
 * - Alterna entre tema claro y oscuro usando Bootstrap.
 * - Cambia el ícono del botón según el tema activo.
 * - Guarda la preferencia del usuario en localStorage.
 * - Dispara un evento personalizado 'themeChanged' al cambiar el tema.
 *
 * DEPENDENCIAS:
 * - Elementos del DOM: botón con id 'themeBtn' e ícono con id 'themeIcon'.
 */

// Elementos del DOM
const botonTema = document.getElementById('themeBtn')
const iconoTema = document.getElementById('themeIcon')
const html = document.documentElement

/**
 * Aplica un tema específico a la página
 * @param {string} tema - 'light' o 'dark'
 */
const setTema = tema => {
  // Aplicar tema con atributo Bootstrap
  html.setAttribute('data-bs-theme', tema)

  // Cambiar icono según el tema
  iconoTema.className = tema === 'dark' ? 'fas fa-moon' : 'fas fa-sun'

  // Guardar preferencia del usuario en localStorage
  localStorage.setItem('theme', tema)

  window.dispatchEvent(new CustomEvent('themeChanged', {
    detail: { theme: tema }
  }))
}

// Aplicar tema guardado o usar tema claro por defecto
setTema(localStorage.getItem('theme') || 'light')

// Manejar click del botón para alternar tema
botonTema.addEventListener('click', () => {
  const temaActual = html.getAttribute('data-bs-theme')
  const nuevoTema = temaActual === 'dark' ? 'light' : 'dark'
  setTema(nuevoTema)
})
