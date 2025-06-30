import { API_ROUTES, tokenUtils } from '../config/api.js'
import { logout, requireAuth } from './auth-guard.js'

import {
  reactivarFormulario,
  recopilarDatosAdmin
} from './utils/unified-form-utils.js'

import {
  validarEmail,
  validarNombre,
  validarPassword
} from './utils/validation-utils.js'

let usuarioActual = null

function validarAdministrador (datos) {
  const errores = []
  const nombreValidation = validarNombre(datos.nombre, { required: true, minLength: 2, maxLength: 50, fieldName: 'nombre' })
  if (!nombreValidation.isValid) errores.push(...nombreValidation.errors)
  const emailValidation = validarEmail(datos.email, { required: true, fieldName: 'email' })
  if (!emailValidation.isValid) errores.push(...emailValidation.errors)
  const passwordValidation = validarPassword(datos.password, { required: true, minLength: 6, maxLength: 100, fieldName: 'contraseña' })
  if (!passwordValidation.isValid) errores.push(...passwordValidation.errors)
  if (!datos.confirmarPassword) {
    errores.push('Debes confirmar la contraseña')
  } else if (datos.password !== datos.confirmarPassword) {
    errores.push('Las contraseñas no coinciden')
  }
  return { esValido: errores.length === 0, errores }
}

// Inicialización y protección de ruta
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await requireAuth()
    usuarioActual = tokenUtils.getDecodedToken()
    if (!usuarioActual || usuarioActual.rol !== 'superadmin') {
      setTimeout(() => {
        window.location.href = '/front-end/html/admin/dashboard.html'
      }, 2000)
      return
    }
    configurarEventListeners()
  } catch (error) {
    console.error(error)
  }
})

function configurarEventListeners () {
  try {
    const form = document.getElementById('formRegistrarAdmin')
    if (form) {
      form.addEventListener('submit', procesarRegistro)
    }
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout)
    }
    console.log('✅ Event listeners configurados correctamente')
  } catch (error) {
    console.error('❌ Error configurando event listeners:', error)
  }
}

// Procesamiento del registro
async function procesarRegistro (e) {
  e.preventDefault()
  try {
    const datosFormulario = {
      nombre: 'nombreAdmin',
      email: 'emailAdmin',
      password: 'passwordAdmin',
      confirmarPassword: 'confirmPasswordAdmin'
    }
    const datosAdmin = recopilarDatosAdmin(datosFormulario)
    // Validar datos usando utilidades externas
    const validacion = validarAdministrador(datosAdmin)
    if (!validacion.esValido) {
      // Aquí podrías mostrar los errores en la UI si lo deseas
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
      console.log('✅ Administrador registrado exitosamente')
      reactivarFormulario('formRegistrarAdmin')
      setTimeout(() => {
        window.location.href = '/front-end/html/admin/dashboard.html'
      }, 3000)
    } else {
      console.error('❌ Error en el registro:', data)
      manejarErrorRegistro(response.status, data)
    }
  } catch (error) {
    console.error('❌ Error al registrar administrador:', error)
  }
}

function manejarErrorRegistro (status, data) {
  if (status === 403) {
    alert('❌ No tiene permisos para registrar administradores', 'error')
  } else if (status === 400 && data.error === 'EMAIL_EXISTS') {
    alert('❌ Ya existe un administrador con este email', 'error')
  } else {
    alert(`❌ ${data.message || 'Error al registrar administrador'}`, 'error')
  }
}
