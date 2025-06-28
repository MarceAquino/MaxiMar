document.addEventListener('DOMContentLoaded', () => {
  console.log('🚪 Configurando sistema de logout...')

  // Buscar el botón de salir
  const botonSalir = document.getElementById('exitBtn')

  // Si existe el botón, configurar su evento
  if (botonSalir) {
    botonSalir.addEventListener('click', manejarSalida)
  }
})

function manejarSalida (evento) {
  evento.preventDefault()

  const confirmar = confirm('¿Estás seguro que quieres salir?')

  if (confirmar) {
    localStorage.clear()
    window.location.href = evento.currentTarget.href
  }
}
