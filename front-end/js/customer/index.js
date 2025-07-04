/**
 * MÓDULO: Página Principal
 *
 * Maneja la funcionalidad de la página de inicio de la tienda.
 *
 * FUNCIONALIDADES:
 * - Truco secreto del carrusel (easter egg)
 * - Sistema de login básico para clientes
 * - Validación y almacenamiento de nombres de usuario
 * - Redirección automática a productos si ya hay usuario
 */

document.addEventListener('DOMContentLoaded', function () {
  // Limpiar flag de redirección si existe
  sessionStorage.removeItem('redirigiendo')

  // Configurar el truco secreto del carrusel
  configurarTrucoSecreto()

  // Configurar el sistema de login de clientes
  configurarLoginCliente()
})

/**
 * Configura el truco secreto del carrusel (easter egg)
 * Secuencia: derecha x3, izquierda x3 para activar efecto especial
 */
function configurarTrucoSecreto () {
  // Variables para el truco secreto
  const clicksUsuario = [] // Guardar los clicks del usuario
  const codigoSecreto = ['right', 'right', 'right', 'left', 'left', 'left'] // Secuencia secreta

  // Elementos del carrusel
  const botonDerecha = document.querySelector('.carousel-control-next')
  const botonIzquierda = document.querySelector('.carousel-control-prev')
  const botonSecreto = document.getElementById('secretButton')
  const carrusel = document.getElementById('petCarousel')

  // Función que se ejecuta cuando se activa el truco
  function activarTrucoSecreto () {
    // Agregar efecto visual al carrusel
    carrusel.classList.add('carousel-flip')
    setTimeout(() => carrusel.classList.remove('carousel-flip'), 10000)

    // Mostrar el botón secreto con animación
    botonSecreto.classList.remove('hidden')
    botonSecreto.classList.add('show')

    // Limpiar la secuencia de clicks
    clicksUsuario.length = 0
  }

  // Evento para el botón derecho del carrusel
  botonDerecha?.addEventListener('click', function () {
    clicksUsuario.push('right')

    // Mantener solo los últimos 6 clicks
    if (clicksUsuario.length > 6) {
      clicksUsuario.shift()
    }

    // Verificar si coincide con el código secreto
    if (JSON.stringify(clicksUsuario) === JSON.stringify(codigoSecreto)) {
      activarTrucoSecreto()
    }
  })

  // Evento para el botón izquierdo del carrusel
  botonIzquierda?.addEventListener('click', function () {
    clicksUsuario.push('left')

    // Mantener solo los últimos 6 clicks
    if (clicksUsuario.length > 6) {
      clicksUsuario.shift()
    }

    // Verificar si coincide con el código secreto
    if (JSON.stringify(clicksUsuario) === JSON.stringify(codigoSecreto)) {
      activarTrucoSecreto()
    }
  })
}

/**
 * Configura el sistema de login básico para clientes
 * Valida nombres de usuario y maneja redirecciones automáticas
 */
function configurarLoginCliente () {
  // Elementos del formulario
  const formularioLogin = document.getElementById('loginForm')
  const campoNombre = document.getElementById('nombreUsuario')

  // Verificar si ya hay un usuario logueado
  const usuarioYaLogueado = localStorage.getItem('nombreUsuario')
  if (usuarioYaLogueado) {
    // Si ya hay usuario guardado, redirigir directamente a productos
    window.location.href = '/front-end/html/customer/productos.html'
    return // Salir de la función
  }

  // Configurar evento del formulario de login
  formularioLogin?.addEventListener('submit', function (evento) {
    evento.preventDefault() // Evitar que la página se recargue

    const nombreIngresado = campoNombre.value.trim()

    // Validar que el nombre tenga al menos 3 caracteres
    if (nombreIngresado.length >= 3) {
      // Guardar nombre en localStorage
      localStorage.setItem('nombreUsuario', nombreIngresado)

      // Mostrar campo como válido
      campoNombre.classList.add('is-valid')

      // Redirigir después de una pequeña pausa para mostrar el efecto visual
      setTimeout(() => {
        window.location.href = '/front-end/html/customer/productos.html'
      }, 300)
    } else {
      // Mostrar campo como inválido
      campoNombre.classList.add('is-invalid')

      // Quitar la clase de error después de 3 segundos
      setTimeout(() => {
        campoNombre.classList.remove('is-invalid')
      }, 3000)
    }
  })
}
