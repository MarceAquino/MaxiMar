/**
 * Registro para nuevos administradores
 *
 * FUNCIONALIDADES:
 * - Registro de nuevos administradores (solo para superadmin)
 * - Validación de datos del formulario
 * - Confirmación mediante modal
 * - Comunicación con API para guardado de registro
 * - Manejo de errores y feedback
 * - Redirección post-registro
 *
 * DEPENDENCIAS:
 * - API_ROUTES: Endpoints de la API
 * - tokenUtils: Manejo de tokens JWT
 * - modales.js: Confirmación visual
 * - auth-guard.js: Protección de ruta
 * - unified-form-utils.js: Utilidades para formularios
 * - validation-utils.js: Funciones de validación
 */

import { API_ROUTES, tokenUtils } from '../config/api.js'
import { confirmarModal } from '../utils/modales.js'
import { requireAuth } from './auth-guard.js'
import { reactivarFormulario, recopilarDatosAdmin } from './utils/unified-form-utils.js'
import { validarEmail, validarNombre } from './utils/validation-utils.js'

/**
 * Administrador de registro para nuevos administradores
 * Solo los superadmin pueden registrar nuevos administradores
 * @module RegisterAdmin
 */

let usuarioActual = null

/**
 * Valida los datos del administrador a registrar
 * @param {Object} datos - Datos del administrador
 * @returns {Object} Resultado de la validación
 */
function validarAdministrador (datos) {
  const errores = {}

  const nombreValidation = validarNombre(datos.nombre, {
    required: true,
    minLength: 2,
    maxLength: 50,
    fieldName: 'nombre'
  })
  if (!nombreValidation.isValid) errores.nombreAdmin = nombreValidation.errors.join(' ')

  const emailValidation = validarEmail(datos.email, {
    required: true,
    fieldName: 'email'
  })
  if (!emailValidation.isValid) errores.emailAdmin = emailValidation.errors.join(' ')

  // Validación de contraseña fuerte
  if (!datos.password || datos.password.length < 8) {
    errores.passwordAdmin = 'La contraseña debe tener al menos 8 caracteres.'
  } else if (!esPasswordFuerte(datos.password)) {
    errores.passwordAdmin = 'Debe incluir mayúsculas, minúsculas, números y símbolos especiales.'
  }

  if (!datos.confirmarPassword) {
    errores.confirmPasswordAdmin = 'Debes confirmar la contraseña'
  } else if (datos.password !== datos.confirmarPassword) {
    errores.confirmPasswordAdmin = 'Las contraseñas no coinciden'
  }

  return { esValido: Object.keys(errores).length === 0, errores }
}
// Limpia los mensajes de error
function limpiarErrores () {
  const errorSpans = document.querySelectorAll('[id^="error-"]')
  errorSpans.forEach(span => {
    span.textContent = ''
    span.classList.add('d-none')
    span.style.display = 'none'
  })
  const inputs = document.querySelectorAll('.form-control.error')
  inputs.forEach(input => input.classList.remove('error'))
}

// Muestra los errores en los spans
function mostrarErroresEnFormulario (errores) {
  limpiarErrores()
  Object.entries(errores).forEach(([campo, mensaje]) => {
    const span = document.getElementById(`error-${campo}`)
    const input = document.getElementById(campo)
    if (span) {
      span.textContent = mensaje
      span.classList.remove('d-none')
      span.style.display = 'block'
    }
    if (input) {
      input.classList.add('error')
    }
  })
}

/**
 * Inicialización de la página de registro
 * Verifica permisos y configura eventos
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await requireAuth()
    usuarioActual = tokenUtils.getDecodedToken()

    // Solo superadmin puede registrar administradores
    if (!usuarioActual || usuarioActual.rol !== 'superadmin') {
      setTimeout(() => {
        window.location.href = '/front-end/html/admin/dashboard.html'
      }, 2000)
      return
    }

    configurarEventListeners()
  } catch (error) {
    // Error de autenticación, el auth-guard manejará la redirección
  }
})

/**
 * Configura los event listeners de la página
 */
function configurarEventListeners () {
  const form = document.getElementById('formRegistrarAdmin')
  if (form) {
    form.addEventListener('submit', procesarRegistro)
  }
}

/**
 * Procesa el formulario de registro de administrador
 * @param {Event} e - Evento del formulario
 */
async function procesarRegistro (e) {
  e.preventDefault()
  limpiarErrores()
  const datosFormulario = {
    nombre: 'nombreAdmin',
    email: 'emailAdmin',
    password: 'passwordAdmin',
    confirmarPassword: 'confirmPasswordAdmin'
  }
  const datosAdmin = recopilarDatosAdmin(datosFormulario)
  // Validar datos
  const validacion = validarAdministrador(datosAdmin)
  if (!validacion.esValido) {
    mostrarErroresEnFormulario(validacion.errores)
    return
  }
  // Validar email duplicado antes de enviar
  if (await emailYaRegistrado(datosAdmin.email)) {
    mostrarErroresEnFormulario({ emailAdmin: 'El email ya está registrado.' })
    return
  }
  // Confirmación visual antes de enviar
  const confirmar = await confirmarModal(
    'Registrar administrador',
    '¿Estás seguro que deseas crear este administrador?',
    'Sí, crear',
    'confirmar'
  )
  if (!confirmar) {
    return
  }
  try {
    // Enviar datos al servidor
    const response = await fetch(API_ROUTES.registrarAdmin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUtils.getToken()}`
      },
      body: JSON.stringify({
        nombre: datosAdmin.nombre,
        email: datosAdmin.email,
        password: datosAdmin.password
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Feedback de éxito visual
      await confirmarModal(
        '¡Éxito!',
        'El administrador fue registrado correctamente.',
        'Aceptar',
        'success'
      )
      reactivarFormulario('formRegistrarAdmin')
      setTimeout(() => {
        window.location.href = '/front-end/html/admin/dashboard.html'
      }, 1000)
    } else {
      manejarErrorRegistro(response.status, data)
    }
  } catch (error) {
    // Error de conexión
    manejarErrorRegistro(500, { message: 'Error de conexión' })
  }
}

// Mostrar/ocultar contraseña
const togglePassword = document.getElementById('togglePassword')
const passwordInput = document.getElementById('passwordAdmin')
const passwordIcon = document.getElementById('passwordIcon')
if (togglePassword && passwordInput && passwordIcon) {
  togglePassword.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text'
      passwordIcon.classList.remove('fa-eye')
      passwordIcon.classList.add('fa-eye-slash')
    } else {
      passwordInput.type = 'password'
      passwordIcon.classList.remove('fa-eye-slash')
      passwordIcon.classList.add('fa-eye')
    }
  })
}

const toggleConfirmPassword = document.getElementById('toggleConfirmPassword')
const confirmPasswordInput = document.getElementById('confirmPasswordAdmin')
const confirmPasswordIcon = document.getElementById('confirmPasswordIcon')
if (toggleConfirmPassword && confirmPasswordInput && confirmPasswordIcon) {
  toggleConfirmPassword.addEventListener('click', function () {
    if (confirmPasswordInput.type === 'password') {
      confirmPasswordInput.type = 'text'
      confirmPasswordIcon.classList.remove('fa-eye')
      confirmPasswordIcon.classList.add('fa-eye-slash')
    } else {
      confirmPasswordInput.type = 'password'
      confirmPasswordIcon.classList.remove('fa-eye-slash')
      confirmPasswordIcon.classList.add('fa-eye')
    }
  })
}

/**
 * Maneja los errores de registro
 * @param {number} status - Código de estado HTTP
 * @param {Object} data - Datos de respuesta del servidor
 */
function manejarErrorRegistro (status, data) {
  if (status === 403) {
    alert('No tienes permisos para registrar administradores', 'error')
  } else if (status === 400 && data.error === 'EMAIL_EXISTS') {
    alert('Ya existe un administrador con este email', 'error')
  } else {
    alert(data.message || 'Error al registrar administrador', 'error')
  }
}

// Validación personalizada de contraseña fuerte
function esPasswordFuerte (password) {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
  return regex.test(password)
}

// Validación de email ya registrado en el backend
async function emailYaRegistrado (email) {
  try {
    const response = await fetch(`${API_ROUTES.validarEmail}?email=${encodeURIComponent(email)}`, {
      headers: tokenUtils.getAuthHeaders()
    })
    if (!response.ok) return false
    const data = await response.json()
    return data.exists
  } catch {
    return false
  }
}
