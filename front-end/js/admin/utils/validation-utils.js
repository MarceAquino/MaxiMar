// ======================================================================
// UTILIDADES DE VALIDACIÓN COMPARTIDAS
// ======================================================================
// Este módulo contiene funciones de validación reutilizables para
// todos los formularios de administración

/**
 * Valida archivos de imagen seleccionados
 * @param {FileList} files - Archivos seleccionados
 * @param {Object} options - Opciones de validación
 * @param {number} options.maxFiles - Máximo número de archivos (por defecto 5)
 * @param {number} options.maxSize - Tamaño máximo por archivo en bytes (por defecto 5MB)
 * @param {string[]} options.allowedTypes - Tipos permitidos (por defecto jpeg, jpg, png)
 * @param {boolean} options.required - Si es obligatorio seleccionar archivos
 * @returns {Object} {esValido: boolean, errores: array}
 */
export function validarImagenes (files, options = {}) {
  const {
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'],
    required = false
  } = options

  const errores = []

  // Verificar si se requieren archivos
  if (required && (!files || files.length === 0)) {
    errores.push('Debe seleccionar al menos una imagen del producto')
    return { esValido: false, errores }
  }

  // Si no hay archivos y no son requeridos, está bien
  if (!files || files.length === 0) {
    return { esValido: true, errores: [] }
  }

  // Verificar límite de archivos
  if (files.length > maxFiles) {
    errores.push(`Máximo ${maxFiles} imágenes permitidas`)
  }

  // Validar cada archivo individualmente
  for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
    const file = files[i]

    // Verificar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      const tiposTexto = allowedTypes.map(type => type.replace('image/', '').toUpperCase()).join(', ')
      errores.push(`${file.name}: Solo se permiten archivos ${tiposTexto}`)
    }

    // Verificar tamaño de archivo
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      errores.push(`${file.name}: El archivo es demasiado grande (máximo ${maxSizeMB}MB)`)
    }
  }

  return {
    esValido: errores.length === 0,
    errores
  }
}

/**
 * Valida que un email tenga formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
export function validarEmail (email) {
  if (!email || email.trim() === '') {
    return false
  }

  // Expresión regular para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Valida contraseña con requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @param {number} options.minLength - Longitud mínima (por defecto 6)
 * @param {number} options.maxLength - Longitud máxima (por defecto 100)
 * @returns {Object} {esValido: boolean, errores: array}
 */
export function validarPassword (password, options = {}) {
  const { minLength = 6, maxLength = 100 } = options
  const errores = []

  if (!password || password.trim() === '') {
    errores.push('La contraseña es obligatoria')
  } else {
    if (password.length < minLength) {
      errores.push(`La contraseña debe tener al menos ${minLength} caracteres`)
    }
    if (password.length > maxLength) {
      errores.push(`La contraseña no puede tener más de ${maxLength} caracteres`)
    }
  }

  return {
    esValido: errores.length === 0,
    errores
  }
}

/**
 * Valida confirmación de contraseña
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {Object} {esValido: boolean, errores: array}
 */
export function validarConfirmacionPassword (password, confirmPassword) {
  const errores = []

  if (!confirmPassword) {
    errores.push('Debes confirmar la contraseña')
  } else if (password !== confirmPassword) {
    errores.push('Las contraseñas no coinciden')
  }

  return {
    esValido: errores.length === 0,
    errores
  }
}

/**
 * Valida campos de texto básicos
 * @param {string} valor - Valor a validar
 * @param {string} nombre - Nombre del campo para errores
 * @param {Object} options - Opciones de validación
 * @param {boolean} options.requerido - Si el campo es obligatorio
 * @param {number} options.minLength - Longitud mínima
 * @param {number} options.maxLength - Longitud máxima
 * @returns {Object} {esValido: boolean, errores: array}
 */
export function validarCampoTexto (valor, nombre, options = {}) {
  const { requerido = true, minLength = 0, maxLength = Infinity } = options
  const errores = []

  // Verificar si es requerido
  if (requerido && (!valor || valor.trim() === '')) {
    errores.push(`${nombre} es obligatorio`)
    return { esValido: false, errores }
  }

  // Si no es requerido y está vacío, está bien
  if (!requerido && (!valor || valor.trim() === '')) {
    return { esValido: true, errores }
  }

  // Validar longitud
  if (valor.length < minLength) {
    errores.push(`${nombre} debe tener al menos ${minLength} caracteres`)
  }
  if (valor.length > maxLength) {
    errores.push(`${nombre} no puede tener más de ${maxLength} caracteres`)
  }

  return {
    esValido: errores.length === 0,
    errores
  }
}

/**
 * Valida campos numéricos
 * @param {number|string} valor - Valor a validar
 * @param {string} nombre - Nombre del campo para errores
 * @param {Object} options - Opciones de validación
 * @param {boolean} options.requerido - Si el campo es obligatorio
 * @param {number} options.min - Valor mínimo
 * @param {number} options.max - Valor máximo
 * @param {boolean} options.entero - Si debe ser número entero
 * @returns {Object} {esValido: boolean, errores: array}
 */
export function validarCampoNumerico (valor, nombre, options = {}) {
  const { requerido = true, min = -Infinity, max = Infinity, entero = false } = options
  const errores = []

  // Verificar si es requerido
  if (requerido && (valor === null || valor === undefined || valor === '')) {
    errores.push(`${nombre} es obligatorio`)
    return { esValido: false, errores }
  }

  // Si no es requerido y está vacío, está bien
  if (!requerido && (valor === null || valor === undefined || valor === '')) {
    return { esValido: true, errores }
  }

  // Convertir a número y validar
  const numero = entero ? parseInt(valor) : parseFloat(valor)

  if (isNaN(numero)) {
    errores.push(`${nombre} debe ser un número válido`)
    return { esValido: false, errores }
  }

  // Validar rangos
  if (numero < min) {
    errores.push(`${nombre} debe ser mayor o igual a ${min}`)
  }
  if (numero > max) {
    errores.push(`${nombre} no puede ser mayor a ${max}`)
  }

  return {
    esValido: errores.length === 0,
    errores
  }
}
