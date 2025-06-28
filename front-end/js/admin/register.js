// ======================================================================
// REGISTRO DE ADMINISTRADORES - VERSIÓN MODULAR
// ======================================================================
// Este archivo maneja el registro de nuevos administradores
// Solo el SuperAdmin puede acceder a esta funcionalidad
//
// MODULAR: Utiliza módulos utilitarios compartidos para evitar duplicación

import { logout, requireAuth } from '../auth-guard.js'
import { API_ROUTES, tokenUtils } from '../config/api.js'

// Importar módulos utilitarios
import {
    clearForm,
    collectFormData,
    setupPasswordToggle,
    setupRealtimePasswordValidation
} from './utils/form-utils.js'
import { showAlert, showErrorList } from './utils/ui-utils.js'
import { validateEmail, validatePassword, validateText } from './utils/validation-utils.js'

// ======================================================================
// VARIABLES GLOBALES SIMPLES
// ======================================================================
let usuarioActual = null

// ======================================================================
// FUNCIONES DE VALIDACIÓN ESPECÍFICAS
// ======================================================================

/**
 * Valida los datos del nuevo administrador usando módulos utilitarios
 * @param {Object} datos - Datos del admin a validar
 * @returns {Object} {esValido: boolean, errores: array}
 */
function validarAdministrador (datos) {
  const errores = []

  // Validar nombre usando validation-utils
  const nombreValidation = validateText(datos.nombre, {
    required: true,
    minLength: 2,
    maxLength: 50,
    fieldName: 'nombre'
  })
  if (!nombreValidation.isValid) {
    errores.push(...nombreValidation.errors)
  }

  // Validar email usando validation-utils
  const emailValidation = validateEmail(datos.email, {
    required: true,
    fieldName: 'email'
  })
  if (!emailValidation.isValid) {
    errores.push(...emailValidation.errors)
  }

  // Validar contraseña usando validation-utils
  const passwordValidation = validatePassword(datos.password, {
    required: true,
    minLength: 6,
    maxLength: 100,
    fieldName: 'contraseña'
  })
  if (!passwordValidation.isValid) {
    errores.push(...passwordValidation.errors)
  }

  // Validar confirmación de contraseña
  if (!datos.confirmarPassword) {
    errores.push('Debes confirmar la contraseña')
  } else if (datos.password !== datos.confirmarPassword) {
    errores.push('Las contraseñas no coinciden')
  }

  return {
    esValido: errores.length === 0,
    errores
  }
}

// ======================================================================
// INICIALIZACIÓN
// ======================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📝 Iniciando página de registro de admins (Modular)...')

  try {
    // 1. Verificar autenticación
    await requireAuth()
    usuarioActual = tokenUtils.getDecodedToken()

    // 2. Verificar que sea SuperAdmin
    if (!usuarioActual || usuarioActual.rol !== 'superadmin') {
      showAlert('❌ Solo el Super Administrador puede acceder a esta página', 'error')
      setTimeout(() => {
        window.location.href = '/front-end/html/admin/dashboard.html'
      }, 2000)
      return
    }

    console.log('✅ SuperAdmin verificado:', usuarioActual.nombre)

    // 3. Configurar eventos
    configurarEventListeners()
  } catch (error) {
    console.error('❌ Error en la inicialización:', error)
    showAlert('❌ Error al cargar la página', 'error')
  }
})

// ======================================================================
// CONFIGURAR EVENTOS
// ======================================================================
function configurarEventListeners () {
  try {
    // Formulario de registro
    const form = document.getElementById('formRegistrarAdmin')
    if (form) {
      form.addEventListener('submit', procesarRegistro)
    }

    // Botón de logout (si existe)
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout)
    }

    // Configurar validación en tiempo real para contraseñas usando form-utils
    setupRealtimePasswordValidation('passwordAdmin', 'confirmPasswordAdmin')

    // Configurar toggles de visibilidad de contraseñas usando form-utils
    setupPasswordToggle('togglePassword', 'passwordAdmin', 'passwordIcon')
    setupPasswordToggle('toggleConfirmPassword', 'confirmPasswordAdmin', 'confirmPasswordIcon')

    console.log('✅ Event listeners configurados correctamente')
  } catch (error) {
    console.error('❌ Error configurando event listeners:', error)
  }
}

// ======================================================================
// PROCESAR REGISTRO DE NUEVO ADMIN
// ======================================================================
async function procesarRegistro (e) {
  e.preventDefault()
  console.log('🚀 Iniciando registro de administrador...')

  try {
    // 1. Recopilar datos del formulario usando form-utils
    const formFields = {
      nombre: 'nombreAdmin',
      email: 'emailAdmin',
      password: 'passwordAdmin',
      confirmarPassword: 'confirmPasswordAdmin'
    }

    const datosAdmin = collectFormData(formFields)
    console.log('📝 Datos recopilados:', { ...datosAdmin, password: '***', confirmarPassword: '***' })

    // 2. Validar datos usando la función de validación modular
    const validacion = validarAdministrador(datosAdmin)
    if (!validacion.esValido) {
      showErrorList(validacion.errores, 'Se encontraron errores en el formulario')
      return
    }

    // 3. Mostrar que estamos procesando usando ui-utils
    showAlert('⏳ Registrando administrador...', 'info')

    // 4. Enviar datos al servidor
    console.log('📤 Enviando datos al servidor...')
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
      // 5. Registro exitoso
      console.log('✅ Administrador registrado exitosamente')
      showAlert(
        `✅ Administrador "${datosAdmin.nombre}" registrado exitosamente!<br>
        <small>Email: ${datosAdmin.email}</small>`,
        'success'
      )

      // Limpiar formulario usando form-utils
      clearForm('formRegistrarAdmin')

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        window.location.href = '/front-end/html/admin/dashboard.html'
      }, 3000)
    } else {
      // 6. Error en el registro
      console.error('❌ Error en el registro:', data)
      manejarErrorRegistro(response.status, data)
    }
  } catch (error) {
    console.error('❌ Error al registrar administrador:', error)
    showAlert('❌ Error de conexión. Verifique su conexión a internet.', 'error')
  }
}

// ======================================================================
// MANEJO DE ERRORES DEL SERVIDOR
// ======================================================================
function manejarErrorRegistro (status, data) {
  if (status === 403) {
    showAlert('❌ No tiene permisos para registrar administradores', 'error')
  } else if (status === 400 && data.error === 'EMAIL_EXISTS') {
    showAlert('❌ Ya existe un administrador con este email', 'error')
  } else {
    showAlert(`❌ ${data.message || 'Error al registrar administrador'}`, 'error')
  }
}
