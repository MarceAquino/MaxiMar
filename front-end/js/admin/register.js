import { API_ROUTES, tokenUtils } from '../config/api.js'
import { confirmarModal } from '../utils/modales.js'
import { requireAuth } from './auth-guard.js'
import { reactivarFormulario, recopilarDatosAdmin } from './utils/unified-form-utils.js'
import { validarEmail, validarNombre, validarPassword } from './utils/validation-utils.js'

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
  const errores = []

  const nombreValidation = validarNombre(datos.nombre, {
    required: true,
    minLength: 2,
    maxLength: 50,
    fieldName: 'nombre'
  })
  if (!nombreValidation.isValid) errores.push(...nombreValidation.errors)

  const emailValidation = validarEmail(datos.email, {
    required: true,
    fieldName: 'email'
  })
  if (!emailValidation.isValid) errores.push(...emailValidation.errors)

  const passwordValidation = validarPassword(datos.password, {
    required: true,
    minLength: 6,
    maxLength: 100,
    fieldName: 'contraseña'
  })
  if (!passwordValidation.isValid) errores.push(...passwordValidation.errors)

  if (!datos.confirmarPassword) {
    errores.push('Debes confirmar la contraseña')
  } else if (datos.password !== datos.confirmarPassword) {
    errores.push('Las contraseñas no coinciden')
  }

  return { esValido: errores.length === 0, errores }
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
  // Creacion de modal para confirmar modificacion producto.
  const confirmar = await confirmarModal('Registrar admin', '¿Estás seguro que desea registrar al nuevo administrador?', 'Registrar', 'confirmar')
  if (!confirmar) {
    return
  }
  try {
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
      // Los errores se muestran en la UI a través de las utilidades
      return
    }

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
      // Registro exitoso
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
