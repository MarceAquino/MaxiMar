/**
 * Módulo de utilidades para manejo de imágenes
 *
 * FUNCIONALIDADES:
 * - Preview de imágenes seleccionadas
 * - Validación de archivos (tipo, tamaño, cantidad)
 * - Visualización de imágenes existentes
 * - Eliminación de imágenes del preview
 * - Configuración de validación en tiempo real
 * - Manejo de eventos para inputs de archivos
 *
 * DEPENDENCIAS:
 * - ui-utils.js: Mostrar mensajes de error
 * - validation-utils.js: Funciones de validación
 */

import { mostrarErrores } from './ui-utils.js'
import { validarImagenes } from './validation-utils.js'

/**
 * Configura el preview de imágenes para un input file
 * @param {string} inputId - ID del input file
 * @param {string} containerId - ID del contenedor donde mostrar los previews
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.required - Si las imágenes son requeridas
 * @param {number} options.maxFiles - Máximo número de archivos
 * @param {Function} options.onValidationError - Callback para errores de validación
 */
export function configurarPreviewImagenes (inputId, containerId, options = {}) {
  const {
    required = false,
    maxFiles = 5,
    onValidationError = null
  } = options

  const input = document.getElementById(inputId)
  const container = document.getElementById(containerId)

  if (!input || !container) {
    return
  }

  input.addEventListener('change', (e) => {
    manejarCambioImagen(e, container, { required, maxFiles, onValidationError })
  })
}

/**
 * Maneja el cambio de archivos de imagen y muestra previews
 * @param {Event} e - Evento de cambio del input file
 * @param {HTMLElement} container - Contenedor donde mostrar previews
 * @param {Object} options - Opciones de configuración
 */
export function manejarCambioImagen (e, container, options = {}) {
  const {
    required = false,
    maxFiles = 5,
    onValidationError = null
  } = options

  const files = e.target.files

  // Limpiar contenedor
  container.innerHTML = ''
  container.style.display = 'none'

  if (files.length === 0) {
    return
  }

  // Validar archivos
  const validacion = validarImagenes(files, { required, maxFiles })
  if (!validacion.esValido) {
    if (onValidationError) {
      onValidationError(validacion.errores)
    } else {
      mostrarErrores(validacion.errores)
    }
    e.target.value = '' // Limpiar selección
    return
  }

  // Verificar límite de archivos y ajustar si es necesario
  if (files.length > maxFiles) {
    mostrarErrores([`Máximo ${maxFiles} imágenes permitidas. Solo se procesarán las primeras ${maxFiles}.`])

    // Crear un nuevo FileList con solo las primeras archivos permitidos
    const dt = new DataTransfer()
    for (let i = 0; i < Math.min(maxFiles, files.length); i++) {
      dt.items.add(files[i])
    }
    e.target.files = dt.files
    return
  }

  // Mostrar container y crear previews
  container.style.display = 'flex'
  crearPreviewsImagenes(files, container)
}

/**
 * Crea previews visuales para los archivos seleccionados
 * @param {FileList} files - Archivos a mostrar
 * @param {HTMLElement} container - Contenedor donde mostrar
 * @param {Object} options - Opciones de estilo
 */
export function crearPreviewsImagenes (files, container, options = {}) {
  const {
    showFileName = true,
    showFileSize = true,
    showIndex = true,
    allowRemove = false
  } = options

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader()

    reader.onload = function (e) {
      console.log('Renderizando preview', file.name)
      const col = document.createElement('div')
      col.className = 'col-6 col-md-4 col-lg-3'
      col.setAttribute('data-file-index', index)

      const isValid = file.type.match(/^image\/(jpeg|jpg|png)$/) && file.size <= 5 * 1024 * 1024
      const statusClass = isValid ? 'border-success' : 'border-danger'
      const statusIcon = isValid ? 'fa-check-circle text-success' : 'fa-exclamation-triangle text-danger'

      let cardContent = `
        <div class="card ${statusClass}" style="border-width: 2px;">
          <img src="${e.target.result}" class="card-img-top" style="height: 120px; object-fit: cover;" alt="Preview ${index + 1}">
          <div class="card-body p-2">
      `

      if (showFileName) {
        cardContent += `
            <small class="d-block text-truncate" title="${file.name}">
              <i class="fas ${statusIcon} me-1"></i>
              ${file.name}
            </small>
        `
      }

      if (showFileSize) {
        cardContent += `
            <small class="text-muted d-block">
              ${(file.size / 1024).toFixed(1)} KB
            </small>
        `
      }

      if (!isValid) {
        cardContent += '<small class="text-danger">Archivo inválido</small>'
      }

      if (showIndex) {
        cardContent += `<small class="text-muted d-block">Imagen ${index + 1} de ${files.length}</small>`
      }

      if (allowRemove) {
        cardContent += `
            <button type="button" class="btn btn-sm btn-danger mt-1 eliminar-imagen-preview" data-index="${index}">
              <i class="fas fa-times"></i> Eliminar
            </button>
        `
      }

      cardContent += `
          </div>
        </div>
      `

      col.innerHTML = cardContent
      container.appendChild(col)
    }

    reader.onerror = function () {
      // Error al leer archivo
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Muestra las imágenes actuales de un producto
 * @param {string|Array} urls - URLs de las imágenes (string JSON o array)
 * @param {string} containerId - ID del contenedor
 * @param {Object} options - Opciones de visualización
 */
export function mostrarImagenesActuales (urls, containerId, options = {}) {
  const {
    baseUrl = '/front-end/img/productos/',
    showIndex = true,
    imageSize = '100px'
  } = options

  const container = document.getElementById(containerId)
  if (!container) {
    console.warn(`❌ No se encontró contenedor: ${containerId}`)
    return
  }

  container.innerHTML = ''

  if (!urls) {
    container.innerHTML = '<p class="text-muted">No hay imágenes actuales</p>'
    return
  }

  let imagenesArray
  try {
    imagenesArray = typeof urls === 'string' ? JSON.parse(urls) : urls
  } catch (e) {
    // Error al parsear URLs
    container.innerHTML = '<p class="text-danger">Error al cargar imágenes</p>'
    return
  }

  if (!Array.isArray(imagenesArray) || imagenesArray.length === 0) {
    container.innerHTML = '<p class="text-muted">No hay imágenes actuales</p>'
    return
  }

  imagenesArray.forEach((url, index) => {
    const imageDiv = document.createElement('div')
    imageDiv.className = 'position-relative d-inline-block'

    let content = `
      <img src="${baseUrl}${url}"
           alt="Imagen ${index + 1}"
           class="img-thumbnail"
           style="width: ${imageSize}; height: ${imageSize}; object-fit: cover;"
           onerror="this.onerror=null;this.src='/front-end/img/notFount.png'">
    `

    if (showIndex) {
      content += `<span class="badge bg-primary position-absolute top-0 end-0">${index + 1}</span>`
    }

    imageDiv.innerHTML = content
    container.appendChild(imageDiv)
  })

  // Configurar event delegation para botones de eliminar si no está ya configurado
  if (!container.dataset.eventConfigured) {
    container.addEventListener('click', manejarEliminarImagen)
    container.dataset.eventConfigured = 'true'
  }
}

/**
 * Maneja la eliminación de imágenes del preview
 * @param {Event} e - Evento de click
 */
function manejarEliminarImagen (e) {
  const button = e.target.closest('.eliminar-imagen-preview')
  if (!button) return

  e.preventDefault()
  const index = parseInt(button.dataset.index)
  eliminarImagenPreview(button, index)
}

/**
 * Función para eliminar imagen del preview
 * @param {HTMLElement} button - Botón que disparó el evento
 * @param {number} index - Índice de la imagen a eliminar
 */
function eliminarImagenPreview (button, index) {
  // Buscar el input file más cercano
  const card = button.closest('.card')
  const container = card.closest('[id]')
  const inputId = container.id.replace('preview', '').replace('Preview', '').replace('Container', '')

  // Intentar diferentes variaciones de nombres de input
  const possibleIds = [inputId, inputId + 'Crear', 'imagenes', 'imagenesCrear']
  let input = null

  for (const id of possibleIds) {
    input = document.getElementById(id)
    if (input) break
  }

  if (!input) {
    // No se encontró el input file
    return
  }

  // Crear nuevo FileList sin el archivo eliminado
  const dt = new DataTransfer()
  Array.from(input.files).forEach((file, i) => {
    if (i !== index) dt.items.add(file)
  })

  input.files = dt.files

  // Recrear previews
  const files = input.files
  container.innerHTML = ''

  if (files.length === 0) {
    container.style.display = 'none'
  } else {
    crearPreviewsImagenes(files, container, { allowRemove: true })
  }
}

/**
 * Utilidad para configurar validación en tiempo real de imágenes
 * @param {string} inputId - ID del input file
 * @param {Object} options - Opciones de validación
 */
export function configurarValidacionImagenes (inputId, options = {}) {
  const input = document.getElementById(inputId)
  if (!input) return

  input.addEventListener('change', (e) => {
    const files = e.target.files
    const validacion = validarImagenes(files, options)

    if (!validacion.esValido) {
      e.target.value = '' // Limpiar selección inválida
      mostrarErrores(validacion.errores)
    }
  })
}
