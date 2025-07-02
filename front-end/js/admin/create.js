import { API_ROUTES, tokenUtils } from '../config/api.js'
import { requireAuth } from './auth-guard.js'
import { deshabilitarBotonTemporal } from './utils/ui-utils.js'
import { configurarCamposDinamicosProducto } from './utils/unified-form-utils.js'

const form = document.getElementById('formCrearProducto')
const imageInput = document.getElementById('imagenesCrear')
const previewContainer = document.getElementById('previewImagenes')

// =====================
// LÓGICA COMPLETA DE IMÁGENES PARA CREATE
// =====================

// 1. Previsualización y validación de imágenes
function mostrarPreviewImagenes (files) {
  previewContainer.innerHTML = ''
  previewContainer.style.display = files.length ? 'flex' : 'none'
  if (!files.length) return

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const col = document.createElement('div')
      col.className = 'col-6 col-md-4 col-lg-3'
      col.innerHTML = `
        <div class="card border-success" style="border-width: 2px;">
          <img src="${e.target.result}" class="card-img-top" style="height: 120px; object-fit: cover;" alt="Preview ${index + 1}">
          <div class="card-body p-2">
            <small class="d-block text-truncate" title="${file.name}">
              <i class="fas fa-check-circle text-success me-1"></i>
              ${file.name}
            </small>
            <small class="text-muted d-block">${(file.size / 1024).toFixed(1)} KB</small>
            <small class="text-muted d-block">Imagen ${index + 1} de ${files.length}</small>
          </div>
        </div>
      `
      previewContainer.appendChild(col)
    }
    reader.readAsDataURL(file)
  })
}

// 2. Validación de imágenes antes de enviar
function validarImagenesFront (files) {
  const maxFiles = 5
  const maxSize = 5 * 1024 * 1024
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  const errores = []
  if (!files.length) errores.push('Debes seleccionar al menos una imagen.')
  if (files.length > maxFiles) errores.push('Máximo 5 imágenes permitidas.')
  Array.from(files).forEach(file => {
    if (!allowedTypes.includes(file.type)) errores.push(`${file.name}: Formato no permitido.`)
    if (file.size > maxSize) errores.push(`${file.name}: Excede el tamaño máximo de 5MB.`)
  })
  return errores
}

// 3. Evento para mostrar previews y validar en tiempo real
if (imageInput && previewContainer) {
  imageInput.addEventListener('change', (e) => {
    const files = e.target.files
    const errores = validarImagenesFront(files)
    if (errores.length) {
      previewContainer.innerHTML = ''
      previewContainer.style.display = 'none'
      alert(errores.join('\n'))
      imageInput.value = ''
      return
    }
    mostrarPreviewImagenes(files)
  })
}

// Manejador de creacion de producto.
async function crearProducto (e) {
  e.preventDefault()
  if (window.submitInProgress) return
  window.procesoSubmitActivo = true
  window.submitInProgress = true
  const submitBtn = form.querySelector('button[type="submit"]')
  const estadoOriginal = deshabilitarBotonTemporal(submitBtn, 'Creando...', 10000)

  try {
    const authHeaders = tokenUtils.getAuthHeaders()
    const files = imageInput.files
    const errores = validarImagenesFront(files)
    if (errores.length) {
      alert(errores.join('\n'))
      return
    }

    // SINCRONIZAR CATEGORIA CON TIPO_PRODUCTO
    const tipoProductoSelect = document.getElementById('tipoProducto')
    const categoriaHidden = document.getElementById('categoriaCrear')
    if (tipoProductoSelect && categoriaHidden) {
      categoriaHidden.value = tipoProductoSelect.value
    }

    const formData = new FormData()

    // Procesar campos del formulario
    const originalFormData = new FormData(form)
    for (const [key, value] of originalFormData.entries()) {
      if (key === 'precio') {
        const precio = parseFloat(value)
        if (isNaN(precio) || precio < 0.01) {
          throw new Error('El precio debe ser un número mayor o igual a 0.01')
        }
        formData.append(key, precio.toString())
      } else if (key === 'stock') {
        const stock = parseInt(value)
        if (isNaN(stock) || stock < 0) {
          throw new Error('El stock debe ser un número igual o mayor a 0')
        }
        formData.append(key, stock.toString())
      } else if (!key.endsWith('_display')) {
        // Agregar todos los campos excepto los de display
        formData.append(key, value)
      }
    }

    // Agregar imágenes
    Array.from(files).forEach(file => {
      formData.append('imagenes', file)
    })

    const response = await fetch(API_ROUTES.crearProducto, {
      method: 'POST',
      headers: authHeaders,
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al crear producto: ${response.status} - ${errorText}`)
    }

    window.location.href = '/front-end/html/admin/dashboard.html'
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    if (estadoOriginal) {
      submitBtn.textContent = estadoOriginal.texto
      submitBtn.disabled = estadoOriginal.deshabilitado
    }
    window.procesoSubmitActivo = false
    window.submitInProgress = false
  }
}

// 5. Reemplazar el event listener del submit
if (form) {
  form.addEventListener('submit', crearProducto)
}

document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAuth()
  if (!admin) return

  configurarCamposDinamicosProducto('tipoProducto', {
    alimento: 'camposAlimentoCrear',
    juguete: 'camposJugueteCrear'
  })

  if (form) {
    form.addEventListener('submit', crearProducto)
  }

  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      const { logout } = await import('../auth-guard.js')
      await logout()
    })
  }
})
