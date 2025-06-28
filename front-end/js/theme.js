const botonTema = document.getElementById('themeBtn')
const iconoTema = document.getElementById('themeIcon')
const html = document.documentElement

const setTema = tema => {
  html.setAttribute('data-bs-theme', tema)
  iconoTema.className = tema === 'dark' ? 'fas fa-moon' : 'fas fa-sun'
  localStorage.setItem('theme', tema)
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: tema } }))
}

setTema(localStorage.getItem('theme') || 'light')

botonTema.addEventListener('click', () => {
  const nuevoTema = html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark'
  setTema(nuevoTema)
})
