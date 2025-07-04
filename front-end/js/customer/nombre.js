/**
 * MÓDULO: Sistema de Nombres de Usuario
 *
 * Maneja el login básico de clientes usando localStorage.
 *
 * FUNCIONALIDADES:
 * - Muestra mensaje de bienvenida si hay usuario logueado
 * - Valida y guarda nombres de usuario (mínimo 4 caracteres)
 * - Redirige automáticamente si ya hay sesión activa
 * - Proporciona feedback visual de validación
 */

function configurarSistemaNombres () {
  // Elementos importantes de la página
  const formularioLogin = document.getElementById('loginForm')
  const campoNombreUsuario = document.getElementById('nombreUsuario')
  const mensajeBienvenida = document.getElementById('welcomeMessage')

  // Obtener usuario guardado del localStorage
  const usuarioGuardado = localStorage.getItem('nombreUsuario')

  // Mostrar mensaje de bienvenida si hay usuario y elemento disponible
  if (mensajeBienvenida && usuarioGuardado) {
    mensajeBienvenida.textContent = `¡Hola, ${usuarioGuardado}!`
  }

  // Verificar si estamos en una página con formulario de login
  if (!formularioLogin || !campoNombreUsuario) {
    return // No es una página de login, salir
  }

  // Si ya hay usuario guardado y estamos en login, redirigir automáticamente
  if (usuarioGuardado) {
    window.location.href = '/front-end/html/customer/productos.html'
    return
  }

  formularioLogin.addEventListener('submit', (evento) => {
    evento.preventDefault() // Evitar que la página se recargue

    const nombreIngresado = campoNombreUsuario.value.trim()

    // Validar longitud mínima del nombre
    if (nombreIngresado.length >= 4) {
      // Guardar nombre en localStorage
      localStorage.setItem('nombreUsuario', nombreIngresado)

      // Mostrar campo como válido
      campoNombreUsuario.classList.add('is-valid')

      // Redirigir después de una pausa visual
      setTimeout(() => {
        window.location.href = '/front-end/html/customer/productos.html'
      }, 300)
    } else {
      campoNombreUsuario.classList.add('is-invalid')

      // Mostrar mensaje de error en el div
      const errorNombre = document.getElementById('errorNombre')
      errorNombre.textContent = 'El nombre es demasiado corto'

      // Quitar error después de 3 segundos
      setTimeout(() => {
        campoNombreUsuario.classList.remove('is-invalid')
        errorNombre.textContent = ''
      }, 3000)
    }
  })

  campoNombreUsuario.addEventListener('input', function () {
    // Quitar clases de validación para estado limpio
    this.classList.remove('is-valid', 'is-invalid')
  })
}

configurarSistemaNombres()
