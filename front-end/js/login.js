import { API_ROUTES, tokenUtils } from './config/api.js'
import { VALIDAR_CLAVE, VALIDAR_EMAIL } from './validaciones/validaciones-login.js'

document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTOS DEL DOM
  const loginForm = document.getElementById('loginForm')
  const alertContainer = document.getElementById('alertContainer')

  // FUNCIÓN: Mostrar mensajes al usuario
  const mostrarMensaje = (mensaje, tipo = 'danger') => {
    alertContainer.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `
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

    // 2. Validar datos antes de enviar
    if (!VALIDAR_EMAIL(email)) {
      mostrarMensaje(`❌ Email inválido: "${email}"<br>Debe tener formato: ejemplo@dominio.com`)
      return
    }

    if (!VALIDAR_CLAVE(password)) {
      mostrarMensaje('❌ Contraseña inválida<br>Debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial')
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
        mostrarMensaje(`✅ Bienvenido, ${data.admin.nombre}!`, 'success')

        // Mostrar rol especial si es superadmin
        if (data.admin.rol === 'superadmin') {
          setTimeout(() => {
            mostrarMensaje('🔰 Ingresaste como Super Administrador', 'info')
          }, 500)
        }

        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/front-end/html/admin/dashboard.html'
        }, 1500)
      } else {
        // 6. Login falló - mostrar error
        mostrarMensaje(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error('Error en login:', error)
      mostrarMensaje('❌ Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      // 7. Ocultar spinner
      mostrarCargando(false)
    }
  })

  // VERIFICAR SI YA ESTÁ LOGUEADO
  verificarSesionExistente()
})

// FUNCIÓN: Verificar si ya hay una sesión activa
async function verificarSesionExistente () {
  if (!tokenUtils.hasToken()) {
    console.log('📝 No hay sesión previa')
    limpiarDatosResduales()
    return
  }

  console.log('🔍 Verificando sesión existente...')

  try {
    const response = await fetch(API_ROUTES.auth.verify, {
      headers: tokenUtils.getAuthHeaders()
    })

    if (response.ok) {
      console.log('✅ Sesión válida - Redirigiendo al dashboard')
      window.location.replace('/front-end/html/admin/dashboard.html')
    } else {
      console.log('❌ Sesión inválida - Limpiando datos')
      limpiarDatosResduales()
    }
  } catch (error) {
    console.log('⚠️ Error verificando sesión:', error)
    limpiarDatosResduales()
  }
}

// FUNCIÓN AUXILIAR: Limpiar datos de sesiones anteriores
function limpiarDatosResduales () {
  tokenUtils.removeToken()
  localStorage.clear()
  sessionStorage.clear()
}
