/**
 * GESTOR DE TEMA CLARO/OSCURO
 * Permite alternar entre tema claro y oscuro usando Bootstrap
 * Guarda la preferencia del usuario en localStorage
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
