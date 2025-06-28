import { requireAuth } from '../auth-guard.js'
import { configurarPreviewImagenes } from './utils/image-utils.js'
import { deshabilitarBotonTemporal } from './utils/ui-utils.js'
import {
  configurarCamposDinamicosProducto,
  manejarEnvioFormulario
} from './utils/unified-form-utils.js'

const form = document.getElementById('formCrearProducto')
const imageInput = document.getElementById('imagenesCrear')
const previewContainer = document.getElementById('previewImagenes')

function obtenerImagenes () {
  return imageInput?.files || null
}

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

async function handleSubmitCreacion (e) {
  if (window.submitInProgress) {
    e.preventDefault()
    return
  }

  window.procesoSubmitActivo = true
  window.submitInProgress = true

  const submitBtn = form.querySelector('button[type="submit"]')
  const estadoOriginal = deshabilitarBotonTemporal(submitBtn, 'Creando...', 10000)

  try {
    await manejarEnvioFormulario(e, {
      esCreacion: true,
      formId: 'formCrearProducto',
      obtenerImagenes
    })
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

document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAuth()
  if (!admin) return

  if (imageInput && previewContainer) {
    configurarPreviewImagenes('imagenesCrear', 'previewImagenes', {
      maxFiles: 5,
      maxSizePerFile: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
  }

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
