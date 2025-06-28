// ======================================================================
// SISTEMA DE LOGOUT - SIMPLE PARA ESTUDIANTES
// ======================================================================
// Este archivo maneja el botón de "Salir" para clientes
// Limpia todos los datos guardados y regresa al inicio

// ======================================================================
// INICIALIZACIÓN CUANDO LA PÁGINA CARGA
// ======================================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚪 Configurando sistema de logout...')

  // Buscar el botón de salir
  const botonSalir = document.getElementById('exitBtn')

  // Si existe el botón, configurar su evento
  if (botonSalir) {
    botonSalir.addEventListener('click', manejarSalida)
    console.log('✅ Botón de salir configurado')
  } else {
    console.log('ℹ️ No hay botón de salir en esta página')
  }
})

// ======================================================================
// FUNCIÓN: MANEJAR SALIDA DEL USUARIO
// ======================================================================
/**
 * Limpia todos los datos del usuario y regresa al inicio
 * @param {Event} evento - Evento del click
 */
function manejarSalida (evento) {
  evento.preventDefault() // Evitar comportamiento por defecto del enlace

  console.log('🚪 Usuario cerrando sesión...')

  // Limpiar TODOS los datos guardados en localStorage
  localStorage.clear()
  console.log('🧹 Datos de localStorage limpiados')

  // Regresar a la página principal
  console.log('🏠 Redirigiendo al inicio...')
  window.location.href = '/front-end/index.html'
}
