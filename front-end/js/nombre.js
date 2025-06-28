// ======================================================================
// GESTIÓN DE NOMBRE DE USUARIO - SIMPLE PARA ESTUDIANTES
// ======================================================================
// Este archivo maneja el nombre del usuario en diferentes páginas
// Funciona tanto para mostrar bienvenidas como para login

// ======================================================================
// FUNCIÓN PRINCIPAL: CONFIGURAR SISTEMA DE NOMBRES
// ======================================================================
/**
 * Configura el sistema de nombres de usuario en cualquier página
 * Maneja tanto el login como mostrar mensajes de bienvenida
 */
function configurarSistemaNombres () {
  console.log('👤 Iniciando sistema de nombres de usuario...')

  // Elementos importantes de la página
  const formularioLogin = document.getElementById('loginForm')
  const campoNombreUsuario = document.getElementById('nombreUsuario')
  const mensajeBienvenida = document.getElementById('welcomeMessage')

  // Obtener usuario guardado
  const usuarioGuardado = localStorage.getItem('nombreUsuario')
  console.log(`👤 Usuario guardado: ${usuarioGuardado || 'ninguno'}`)

  // ======================================================================
  // MOSTRAR MENSAJE DE BIENVENIDA
  // ======================================================================
  if (mensajeBienvenida && usuarioGuardado) {
    mensajeBienvenida.textContent = `¡Hola, ${usuarioGuardado}!`
    console.log('👋 Mensaje de bienvenida mostrado')
  }

  // ======================================================================
  // CONFIGURAR FORMULARIO DE LOGIN (si existe)
  // ======================================================================
  if (!formularioLogin || !campoNombreUsuario) {
    console.log('ℹ️ No hay formulario de login en esta página')
    return // No es una página de login, salir
  }

  // Si ya hay usuario guardado y estamos en login, redirigir
  if (usuarioGuardado) {
    console.log('🔄 Usuario ya logueado, redirigiendo...')
    window.location.href = '/front-end/html/customer/productos.html'
    return
  }

  // ======================================================================
  // EVENTO: PROCESAR FORMULARIO DE LOGIN
  // ======================================================================
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

      // Mostrar campo como inválido
      campoNombreUsuario.classList.add('is-invalid')

      // Quitar error después de 3 segundos
      setTimeout(() => {
        campoNombreUsuario.classList.remove('is-invalid')
      }, 3000)
    }
  })

  // ======================================================================
  // EVENTO: LIMPIAR VALIDACIÓN AL ESCRIBIR
  // ======================================================================
  campoNombreUsuario.addEventListener('input', function () {
    // Quitar clases de validación para estado limpio
    this.classList.remove('is-valid', 'is-invalid')
  })
}

// ======================================================================
// INICIALIZAR CUANDO LA PÁGINA CARGA
// ======================================================================
configurarSistemaNombres()
