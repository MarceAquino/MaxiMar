import { requireAuth } from './auth-guard.js'
import { deshabilitarBotonTemporal } from './utils/ui-utils.js'
import {
  configurarCamposDinamicosProducto
} from './utils/unified-form-utils.js'

const form = document.getElementById('formCrearProducto')
const imageInput = document.getElementById('imagenesCrear')
const previewContainer = document.getElementById('previewImagenes')

function configurarValidacionTiempoReal () {
  const campos = [
    {
      id: 'codigoCrear',
      validaciones: [
        { condicion: v => v.length < 3, mensaje: 'Código mínimo 3 caracteres' },
        { condicion: v => v.length > 20, mensaje: 'Máximo 20 caracteres' }
      ]
    },
    {
      id: 'nombreCrear',
      validaciones: [
        { condicion: v => v.length < 3, mensaje: 'Nombre mínimo 3 caracteres' },
        { condicion: v => v.length > 100, mensaje: 'Máximo 100 caracteres' }
      ]
    },
    {
      id: 'marcaCrear',
      validaciones: [
        { condicion: v => v.length < 2, mensaje: 'Marca mínima 2 caracteres' },
        { condicion: v => v.length > 50, mensaje: 'Máximo 50 caracteres' }
      ]
    },
    {
      id: 'precioCrear',
      validaciones: [
        { condicion: v => isNaN(v) || parseFloat(v) <= 0, mensaje: 'Precio inválido' }
      ]
    },
    {
      id: 'stockCrear',
      validaciones: [
        { condicion: v => isNaN(v) || parseInt(v) < 0, mensaje: 'Stock inválido' },
        { condicion: v => !Number.isInteger(parseFloat(v)), mensaje: 'Debe ser entero' }
      ]
    }
  ]

  campos.forEach(({ id, validaciones }) => {
    const el = document.getElementById(id)
    if (!el) return

    el.addEventListener('input', () => validarCampoTiempoReal(el, validaciones))
    el.addEventListener('blur', () => validarCampoTiempoReal(el, validaciones))
  })
}

function validarCampoTiempoReal (el, validaciones) {
  const valor = el.value.trim()
  let error = ''
  for (const v of validaciones) {
    if (v.condicion(valor)) {
      error = v.mensaje
      break
    }
  }

  if (error) {
    el.classList.add('is-invalid')
    el.classList.remove('is-valid')
    const feedback = el.nextElementSibling
    if (feedback) feedback.textContent = error
  } else if (valor) {
    el.classList.add('is-valid')
    el.classList.remove('is-invalid')
  } else {
    el.classList.remove('is-valid', 'is-invalid')
  }
}

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

// 4. Envío del formulario con imágenes
async function handleSubmitCreacion (e) {
  e.preventDefault()
  if (window.submitInProgress) return
  window.procesoSubmitActivo = true
  window.submitInProgress = true
  const submitBtn = form.querySelector('button[type="submit"]')
  const estadoOriginal = deshabilitarBotonTemporal(submitBtn, 'Creando...', 10000)
  try {
    const files = imageInput.files
    const errores = validarImagenesFront(files)
    if (errores.length) {
      alert(errores.join('\n'))
      return
    }
    const formData = new FormData(form)
    Array.from(files).forEach(file => {
      formData.append('imagenes', file)
    })
    // Cambia la URL para apuntar al backend real
    const response = await fetch('http://localhost:3030/api/products', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      body: formData
    })
    if (!response.ok) throw new Error('Error al crear producto')
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
  form.addEventListener('submit', handleSubmitCreacion)
  configurarValidacionTiempoReal()
}

document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAuth()
  if (!admin) return

  configurarCamposDinamicosProducto('tipoProducto', {
    alimento: 'camposAlimentoCrear',
    juguete: 'camposJugueteCrear'
  })

  if (form) {
    form.addEventListener('submit', handleSubmitCreacion)
    configurarValidacionTiempoReal()
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
