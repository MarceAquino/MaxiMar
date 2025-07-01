import { API_ROUTES, tokenUtils } from '../config/api.js'

document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTOS DEL DOM
  const loginForm = document.getElementById('loginForm')
  const alertContainer = document.getElementById('alertContainer')

  // CONFIGURAR TOGGLE DE CONTRASEÑA
  const configurarPasswordToggle = () => {
    const toggleBtn = document.querySelector('.password-toggle')
    const passwordInput = document.getElementById('claveAdmin')
    const toggleIcon = document.getElementById('toggleIcon-claveAdmin')

    if (toggleBtn && passwordInput && toggleIcon) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault()

        if (passwordInput.type === 'password') {
          passwordInput.type = 'text'
          toggleIcon.className = 'fas fa-eye-slash'
        } else {
          passwordInput.type = 'password'
          toggleIcon.className = 'fas fa-eye'
        }
      })
      console.log('✅ Toggle de contraseña configurado')
    }
  }

  // FUNCIÓN: Mostrar mensajes al usuario
  const mostrarMensaje = (mensaje, tipo = 'danger') => {
    const span = document.createElement('span')
    span.textContent = mensaje
    span.className = `text-${tipo === 'success' ? 'success' : tipo === 'info' ? 'info' : 'danger'}`

    alertContainer.innerHTML = ''
    alertContainer.appendChild(span)
  }

  // FUNCIÓN: Mostrar/ocultar spinner de carga
  const mostrarCargando = (mostrar) => {
    const submitBtn = loginForm.querySelector('button[type="submit"]')
    const btnText = submitBtn.querySelector('.btn-text') || submitBtn

    if (mostrar) {
      submitBtn.disabled = true
      btnText.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Ingresando...'
    } else {
      submitBtn.disabled = false
      btnText.innerHTML = 'Ingresar'
    }
  }

  // EVENTO: Procesar formulario de login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    // 1. Obtener datos del formulario
    const email = document.getElementById('emailAdmin').value.trim()
    const password = document.getElementById('claveAdmin').value.trim()

    // 2. Validar solo que los campos no estén vacíos
    if (!email) {
      mostrarMensaje('Por favor ingresa tu email')
      return
    }

    if (!password) {
      mostrarMensaje('Por favor ingresa tu contraseña')
      return
    }

    // 3. Mostrar que estamos procesando
    mostrarCargando(true)

    try {
      // 4. Enviar datos al servidor
      const response = await fetch(API_ROUTES.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // 5. Login exitoso - guardar token y redirigir
        tokenUtils.saveToken(data.token)
        mostrarMensaje(`Bienvenido, ${data.admin.nombre}!`, 'success')

        // Mostrar rol especial si es superadmin
        if (data.admin.rol === 'superadmin') {
          setTimeout(() => {
            mostrarMensaje('Ingresaste como Super Administrador', 'info')
          }, 500)
        }

        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/front-end/html/admin/dashboard.html'
        }, 1500)
      } else {
        // 6. Login falló - mostrar error del servidor
        mostrarMensaje(data.message || 'Credenciales incorrectas')
      }
    } catch (error) {
      console.error('Error en login:', error)
      mostrarMensaje('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      // 7. Ocultar spinner
      mostrarCargando(false)
    }
  })

  // Configurar toggle de contraseña
  configurarPasswordToggle()
})
