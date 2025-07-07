import { API_ROUTES, tokenUtils } from '../config/api.js'

/**
 * Administrador de login para el panel de administración
 * Maneja la autenticación de administradores y la redirección al dashboard
 * @module LoginAdmin
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const loginForm = document.getElementById('loginForm')
  const alertContainer = document.getElementById('alertContainer')

  /**
   * Configura el toggle para mostrar/ocultar contraseña
   */
  const setupPasswordToggle = () => {
    const toggleBtn = document.querySelector('.password-toggle')
    const passwordInput = document.getElementById('claveAdmin')
    const toggleIcon = document.getElementById('toggleIcon-claveAdmin')

    if (toggleBtn && passwordInput && toggleIcon) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault()
        togglePasswordVisibility(passwordInput, toggleIcon)
      })
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   * @param {HTMLInputElement} passwordInput - Campo de contraseña
   * @param {HTMLElement} toggleIcon - Icono del toggle
   */
  const togglePasswordVisibility = (passwordInput, toggleIcon) => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text'
      toggleIcon.className = 'fas fa-eye-slash'
    } else {
      passwordInput.type = 'password'
      toggleIcon.className = 'fas fa-eye'
    }
  }

  /**
   * Muestra un mensaje al usuario en el contenedor de alertas
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de mensaje (success, danger, info)
   */
  const showMessage = (message, type = 'danger') => {
    const span = document.createElement('span')
    span.textContent = message
    span.className = `text-${type}`

    alertContainer.innerHTML = ''
    alertContainer.appendChild(span)
  }

  /**
   * Controla el estado de carga del botón de envío
   * @param {boolean} loading - Si debe mostrar estado de carga
   */
  const setLoadingState = (loading) => {
    const submitBtn = loginForm.querySelector('button[type="submit"]')
    const btnText = submitBtn.querySelector('.btn-text') || submitBtn

    if (loading) {
      submitBtn.disabled = true
      btnText.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Iniciando sesión...'
    } else {
      submitBtn.disabled = false
      btnText.innerHTML = 'Ingresar'
    }
  }

  /**
   * Procesa el formulario de login
   * @param {Event} e - Evento del formulario
   */
  const processLogin = async (e) => {
    e.preventDefault()

    // Obtener datos del formulario
    const email = document.getElementById('emailAdmin').value.trim()
    const password = document.getElementById('claveAdmin').value.trim()

    // Validar campos requeridos
    if (!email) {
      showMessage('Por favor ingresa tu email')
      return
    }

    if (!password) {
      showMessage('Por favor ingresa tu contraseña')
      return
    }

    // Mostrar estado de carga
    setLoadingState(true)

    try {
      // Realizar petición de login
      const response = await fetch(API_ROUTES.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Login exitoso
        tokenUtils.saveToken(data.token)
        showMessage('Inicio de sesión exitoso', 'success')

        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/front-end/html/admin/dashboard.html'
        }, 1000)
      } else {
        // Login falló
        showMessage(data.message || 'Credenciales incorrectas')
      }
    } catch (error) {
      showMessage('Error de conexión. Verifica tu conexión a internet.')
    } finally {
      // Ocultar estado de carga
      setLoadingState(false)
    }
  }

  // Configurar eventos
  loginForm.addEventListener('submit', processLogin)
  setupPasswordToggle()
})
