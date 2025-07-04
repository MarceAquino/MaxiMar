function configurarSistemaNombres () {
  // Elementos importantes de la página
  const formularioLogin = document.getElementById('loginForm')
  const campoNombreUsuario = document.getElementById('nombreUsuario')
  const mensajeBienvenida = document.getElementById('welcomeMessage')

  // Obtener usuario guardado
  const usuarioGuardado = localStorage.getItem('nombreUsuario')
  if (mensajeBienvenida && usuarioGuardado) {
    mensajeBienvenida.textContent = `¡Hola, ${usuarioGuardado}!`
  }

  if (!formularioLogin || !campoNombreUsuario) {
    return // No es una página de login, salir
  }

  // Si ya hay usuario guardado y estamos en login, redirigir
  if (usuarioGuardado) {
    console.log('🔄 Usuario ya logueado, redirigiendo...')
    window.location.href = '/front-end/html/customer/productos.html'
    return
  }

  formularioLogin.addEventListener('submit', (evento) => {
    evento.preventDefault() // Evitar que la página se recargue

    const nombreIngresado = campoNombreUsuario.value.trim()
    console.log(`👤 Intento de login: "${nombreIngresado}"`)

    // Validar longitud mínima del nombre
    if (nombreIngresado.length >= 4) {
      console.log('✅ Nombre válido, guardando usuario')

      // Guardar nombre en localStorage
      localStorage.setItem('nombreUsuario', nombreIngresado)

      // Mostrar campo como válido
      campoNombreUsuario.classList.add('is-valid')

      // Redirigir después de una pausa visual
      setTimeout(() => {
        console.log('🔄 Redirigiendo a productos...')
        window.location.href = '/front-end/html/customer/productos.html'
      }, 300)
    } else {
      console.log('❌ Nombre muy corto, mostrando error')

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
