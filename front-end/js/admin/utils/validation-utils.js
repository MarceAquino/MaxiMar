/**
 * Módulo de utilidades de validación
 *
 * FUNCIONALIDADES:
 * - Validación de imágenes (tipo, tamaño, cantidad)
 * - Validación de emails (formato)
 * - Validación de contraseñas y confirmación de contraseña
 * - Validación de nombre
 */

/**
 * Construye objeto de resultado estandarizado para validaciones
 * @param {boolean} isValid - Indica si la validación fue exitosa
 * @param {Array} errores - Lista de mensajes de error
 * @returns {Object} Objeto con formato {isValid, errors}
 */
function buildResult (isValid, errores) {
  return { isValid, errors: errores }
}

// Valida archivos de imagen según parámetros configurables
export function validarImagenes (files, options = {}) {
  const {
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'],
    required = false
  } = options

  const errores = []

  if (required && (!files || files.length === 0)) {
    errores.push('Debe seleccionar al menos una imagen del producto')
    return buildResult(false, errores)
  }

  if (!files || files.length === 0) {
    return buildResult(true, [])
  }

  if (files.length > maxFiles) {
    errores.push(`Máximo ${maxFiles} imágenes permitidas`)
  }

  for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
    const file = files[i]
    if (!allowedTypes.includes(file.type)) {
      const tipos = allowedTypes.map(t => t.replace('image/', '').toUpperCase()).join(', ')
      errores.push(`${file.name}: Solo se permiten archivos ${tipos}`)
    }
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(1)
      errores.push(`${file.name}: El archivo es demasiado grande (máximo ${maxMB}MB)`)
    }
  }

  return buildResult(errores.length === 0, errores)
}

// Valida que se ingrese un email valido.
export function validarEmail (email, { required = true, fieldName = 'email' } = {}) {
  const errores = []
  if (required && (!email || email.trim() === '')) {
    errores.push(`${fieldName} es obligatorio`)
    return buildResult(false, errores)
  }

  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      errores.push(`${fieldName} no tiene un formato válido`)
    }
  }

  return buildResult(errores.length === 0, errores)
}

// Valida que se ingrese un password valido
export function validarPassword (password, { required = true, minLength = 6, maxLength = 100, fieldName = 'contraseña' } = {}) {
  const errores = []

  if (required && (!password || password.trim() === '')) {
    errores.push(`${fieldName} es obligatoria`)
  } else {
    if (password.length < minLength) {
      errores.push(`${fieldName} debe tener al menos ${minLength} caracteres`)
    }
    if (password.length > maxLength) {
      errores.push(`${fieldName} no puede tener más de ${maxLength} caracteres`)
    }
  }

  return buildResult(errores.length === 0, errores)
}

// Valida que el password y confirmacion de password esten ingresados y sean iguales
export function validarConfirmacionPassword (password, confirmPassword) {
  const errores = []

  if (!confirmPassword) {
    errores.push('Debes confirmar la contraseña')
  } else if (password !== confirmPassword) {
    errores.push('Las contraseñas no coinciden')
  }

  return buildResult(errores.length === 0, errores)
}

// Valida el nombre ingresado al registrar un admin
export function validarNombre (nombre, { required = true, minLength = 2, maxLength = 50, fieldName = 'nombre' } = {}) {
  return validarCampoTexto(nombre, fieldName, { requerido: required, minLength, maxLength })
}

// Valida el campo de texto ingresado
export function validarCampoTexto (valor, nombre, { requerido = true, minLength = 0, maxLength = Infinity } = {}) {
  const errores = []

  if (requerido && (!valor || valor.trim() === '')) {
    errores.push(`${nombre} es obligatorio`)
    return buildResult(false, errores)
  }

  if (!requerido && (!valor || valor.trim() === '')) {
    return buildResult(true, errores)
  }

  if (valor.length < minLength) {
    errores.push(`${nombre} debe tener al menos ${minLength} caracteres`)
  }
  if (valor.length > maxLength) {
    errores.push(`${nombre} no puede tener más de ${maxLength} caracteres`)
  }

  return buildResult(errores.length === 0, errores)
}

// Valida el ingreso de los campos numericos en formularios.
export function validarCampoNumerico (valor, nombre, { requerido = true, min = -Infinity, max = Infinity, entero = false } = {}) {
  const errores = []

  if (requerido && (valor === null || valor === undefined || valor === '')) {
    errores.push(`${nombre} es obligatorio`)
    return buildResult(false, errores)
  }

  if (!requerido && (valor === null || valor === undefined || valor === '')) {
    return buildResult(true, errores)
  }

  const numero = entero ? parseInt(valor) : parseFloat(valor)
  if (isNaN(numero)) {
    errores.push(`${nombre} debe ser un número válido`)
    return buildResult(false, errores)
  }

  if (numero < min) {
    errores.push(`${nombre} debe ser mayor o igual a ${min}`)
  }
  if (numero > max) {
    errores.push(`${nombre} no puede ser mayor a ${max}`)
  }

  return buildResult(errores.length === 0, errores)
}
