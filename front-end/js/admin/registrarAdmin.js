/**
 * Módulo para el registro de administradores en el panel de administración.
 *
 * FUNCIONALIDADES:
 * - Validación de campos del formulario, incluyendo confirmacion de contraseña.
 * - Verificación si el email ya está registrado mediante consulta al backend.
 * - Manejo visual de errores específicos debajo de cada campo.
 * - Confirmación mediante modal antes de enviar el registro.
 * - Envío de datos al backend con autenticación para registrar nuevo administrador.
 * - Control de acceso para que solo usuarios con rol "superadmin" puedan registrar.
 * - Funcionalidad para mostrar/ocultar contraseña.
 * - Reactivación del formulario tras registro exitoso y redirección al dashboard.
 *
 * DEPENDENCIAS:
 * - API_ROUTES y tokenUtils para manejo de rutas y autenticación.
 * - confirmarModal para mostrar modales de confirmación y éxito.
 * - requireAuth para proteger la ruta y validar permisos.
 * - reactivarFormulario y recopilarDatosAdmin para manejo y validación de formularios.
 */

import { API_ROUTES, tokenUtils } from '../config/api.js'
import { confirmarModal } from '../utils/modales.js'
import { requireAuth } from './auth-guard.js'
import { reactivarFormulario, recopilarDatosAdmin } from './utils/unified-form-utils.js'

// Validar campos del formulario (nombre, email, contraseña, confirmación)
function validar (datos) {
  const errores = {}
  if (!datos.nombre || datos.nombre.trim().length < 2) errores.nombreAdmin = 'Mínimo 2 letras.'
  if (datos.nombre && datos.nombre.length > 50) errores.nombreAdmin = 'Máximo 50 letras.'
  if (!datos.email || !/^\S+@\S+\.\S+$/.test(datos.email)) errores.emailAdmin = 'Email inválido.'
  if (!datos.password || datos.password.length < 8) errores.passwordAdmin = 'Mínimo 8 caracteres.'
  else if (!esPasswordFuerte(datos.password)) errores.passwordAdmin = 'Debe tener mayúscula, minúscula, número y símbolo.'
  if (!datos.confirmarPassword) errores.confirmPasswordAdmin = 'Confirma la contraseña.'
  else if (datos.password !== datos.confirmarPassword) errores.confirmPasswordAdmin = 'No coinciden.'
  return errores
}

// Validar contraseña fuerte (mínimo 8, mayúscula, minúscula, número y símbolo)
function esPasswordFuerte (pass) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pass)
}

// Limpiar mensajes de error visuales
function limpiarErrores () {
  document.querySelectorAll('[id^="error-"]').forEach(s => { s.textContent = ''; s.classList.add('d-none'); s.style.display = 'none' })
  document.querySelectorAll('.form-control.error').forEach(i => i.classList.remove('error'))
}

// Mostrar errores debajo de cada campo
function mostrarErrores (errores) {
  limpiarErrores()
  Object.entries(errores).forEach(([campo, msg]) => {
    const span = document.getElementById(`error-${campo}`)
    const input = document.getElementById(campo)
    if (span) { span.textContent = msg; span.classList.remove('d-none'); span.style.display = 'block' }
    if (input) input.classList.add('error')
  })
}

// Consultar si el email ya está registrado (petición protegida)
async function emailYaRegistrado (email) {
  try {
    const r = await fetch(`${API_ROUTES.validarEmail}?email=${encodeURIComponent(email)}`, { headers: tokenUtils.getAuthHeaders() })
    if (!r.ok) return false
    const d = await r.json()
    return d.exists
  } catch { return false }
}

// Manejar errores de registro (alerta simple)
function manejarErrorRegistro (status, data) {
  if (status === 403) alert('No tienes permisos para registrar administradores', 'error')
  else if (status === 400 && data.error === 'EMAIL_EXISTS') alert('Ya existe un administrador con este email', 'error')
  else alert(data.message || 'Error al registrar administrador', 'error')
}

// Mostrar/ocultar contraseña (icono de ojo)
function togglePassword (inputId, toggleId, iconId) {
  const input = document.getElementById(inputId)
  const toggle = document.getElementById(toggleId)
  const icon = document.getElementById(iconId)
  if (toggle && input && icon) {
    toggle.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text'; icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash')
      } else {
        input.type = 'password'; icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye')
      }
    })
  }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  // Proteger ruta: solo superadmin puede registrar
  await requireAuth()
  const usuario = tokenUtils.getDecodedToken()
  if (!usuario || usuario.rol !== 'superadmin') {
    setTimeout(() => { window.location.href = '/front-end/html/admin/dashboard.html' }, 2000)
    return
  }
  // Listeners de formulario y toggles de contraseña
  const form = document.getElementById('formRegistrarAdmin')
  if (form) form.addEventListener('submit', procesarRegistro)
  togglePassword('passwordAdmin', 'togglePassword', 'passwordIcon')
  togglePassword('confirmPasswordAdmin', 'toggleConfirmPassword', 'confirmPasswordIcon')
})

// Procesar registro de admin
async function procesarRegistro (e) {
  e.preventDefault()
  limpiarErrores()
  // Recopilar datos del formulario
  const datos = recopilarDatosAdmin({
    nombre: 'nombreAdmin',
    email: 'emailAdmin',
    password: 'passwordAdmin',
    confirmarPassword: 'confirmPasswordAdmin'
  })
  // Validar datos
  const errores = validar(datos)
  if (Object.keys(errores).length) { mostrarErrores(errores); return }
  // Validar email único
  if (await emailYaRegistrado(datos.email)) { mostrarErrores({ emailAdmin: 'El email ya está registrado.' }); return }
  // Confirmar acción
  const ok = await confirmarModal('Registrar administrador', '¿Estás seguro que deseas crear este administrador?', 'Sí, crear', 'confirmar')
  if (!ok) return
  // Enviar datos al backend
  try {
    const r = await fetch(API_ROUTES.registrarAdmin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenUtils.getToken()}` },
      body: JSON.stringify({ nombre: datos.nombre, email: datos.email, password: datos.password })
    })
    const d = await r.json()
    if (r.ok) {
      await confirmarModal('¡Éxito!', 'El administrador fue registrado correctamente.', 'Aceptar', 'success')
      reactivarFormulario('formRegistrarAdmin')
      setTimeout(() => { window.location.href = '/front-end/html/admin/dashboard.html' }, 1000)
    } else {
      manejarErrorRegistro(r.status, d)
    }
  } catch {
    manejarErrorRegistro(500, { message: 'Error de conexión' })
  }
}
