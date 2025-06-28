// ======================================================================
// CREACIÓN DE PRODUCTOS - REFACTORIZADO CON MÓDULO UNIFICADO
// ======================================================================
// Este archivo maneja la creación de nuevos productos
// Utiliza el módulo unificado para eliminar duplicación de código

import { requireAuth } from '../auth-guard.js'

// Importar módulos utilitarios específicos
import { configurarPreviewImagenes } from './utils/image-utils.js'
import { deshabilitarBotonTemporal } from './utils/ui-utils.js'

// Importar módulo unificado de formularios
import {
  configurarCamposDinamicosProducto,
  manejarEnvioFormulario
} from './utils/unified-form-utils.js'

// ======================================================================
// VARIABLES GLOBALES
// ======================================================================
const form = document.getElementById('formCrearProducto')
const imageInput = document.getElementById('imagenesCrear')
const previewContainer = document.getElementById('previewImagenes')

// ======================================================================
// FUNCIÓN PARA OBTENER IMÁGENES
// ======================================================================

/**
 * Obtiene las imágenes seleccionadas del input
 * @returns {FileList} Lista de archivos de imagen
 */
function obtenerImagenes () {
  return imageInput?.files || null
}

// ======================================================================
// VALIDACIÓN EN TIEMPO REAL
// ======================================================================

/**
 * Configura validación en tiempo real para los campos del formulario
 */
function configurarValidacionTiempoReal () {
  const campos = [
    {
      id: 'codigoCrear',
      validaciones: [
        {
          condicion: (valor) => valor.length < 3,
          mensaje: 'El código debe tener al menos 3 caracteres'
        },
        {
          condicion: (valor) => valor.length > 20,
          mensaje: 'El código no puede tener más de 20 caracteres'
        }
      ]
    },
    {
      id: 'nombreCrear',
      validaciones: [
        {
          condicion: (valor) => valor.length < 3,
          mensaje: 'El nombre debe tener al menos 3 caracteres'
        },
        {
          condicion: (valor) => valor.length > 100,
          mensaje: 'El nombre no puede tener más de 100 caracteres'
        }
      ]
    },
    {
      id: 'marcaCrear',
      validaciones: [
        {
          condicion: (valor) => valor.length < 2,
          mensaje: 'La marca debe tener al menos 2 caracteres'
        },
        {
          condicion: (valor) => valor.length > 50,
          mensaje: 'La marca no puede tener más de 50 caracteres'
        }
      ]
    },
    {
      id: 'precioCrear',
      validaciones: [
        {
          condicion: (valor) => isNaN(parseFloat(valor)) || parseFloat(valor) <= 0,
          mensaje: 'El precio debe ser un número mayor a 0'
        },
        {
          condicion: (valor) => parseFloat(valor) < 0.01,
          mensaje: 'El precio mínimo es $0.01'
        }
      ]
    },
    {
      id: 'stockCrear',
      validaciones: [
        {
          condicion: (valor) => isNaN(parseInt(valor)) || parseInt(valor) < 0,
          mensaje: 'El stock debe ser un número entero mayor o igual a 0'
        },
        {
          condicion: (valor) => !Number.isInteger(parseFloat(valor)),
          mensaje: 'El stock debe ser un número entero'
        }
      ]
    }
  ]

  campos.forEach(campo => {
    const elemento = document.getElementById(campo.id)
    if (elemento) {
      elemento.addEventListener('input', () => {
        validarCampoTiempoReal(elemento, campo.validaciones)
      })
      elemento.addEventListener('blur', () => {
        validarCampoTiempoReal(elemento, campo.validaciones)
      })
    }
  })
}

/**
 * Valida un campo en tiempo real y muestra feedback visual
 */
function validarCampoTiempoReal (elemento, validaciones) {
  const valor = elemento.value.trim()
  let errorEncontrado = false
  let mensajeError = ''

  // Solo validar si el campo tiene contenido
  if (valor) {
    for (const validacion of validaciones) {
      if (validacion.condicion(valor)) {
        errorEncontrado = true
        mensajeError = validacion.mensaje
        break
      }
    }
  }

  // Aplicar clases de Bootstrap
  if (errorEncontrado) {
    elemento.classList.remove('is-valid')
    elemento.classList.add('is-invalid')

    // Actualizar mensaje en el div de feedback
    const feedbackDiv = elemento.nextElementSibling
    if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
      feedbackDiv.textContent = mensajeError
    }
  } else if (valor) {
    elemento.classList.remove('is-invalid')
    elemento.classList.add('is-valid')
  } else {
    // Si está vacío, limpiar todas las clases
    elemento.classList.remove('is-valid', 'is-invalid')
  }
}

// ======================================================================
// MANEJO DEL FORMULARIO
// ======================================================================

/**
 * Maneja el envío del formulario de creación
 * @param {Event} e - Evento de submit
 */
async function handleSubmitCreacion (e) {
  // DEBUGGING: Prevenir múltiples submits
  if (window.submitInProgress) {
    console.log('⚠️ Submit ya en progreso, ignorando...')
    e.preventDefault()
    return
  }

  // Establecer bandera para evitar interferencias de admin-security
  window.procesoSubmitActivo = true
  window.submitInProgress = true
  console.log('🔒 Proceso de submit activado - Admin security pausado')

  // Deshabilitar botón temporalmente
  const submitBtn = form.querySelector('button[type="submit"]')
  const estadoOriginal = deshabilitarBotonTemporal(submitBtn, 'Creando producto...', 10000) // 10 segundos para debugging

  try {
    console.log('🚀 Iniciando proceso de envío...')

    await manejarEnvioFormulario(e, {
      esCreacion: true,
      formId: 'formCrearProducto',
      obtenerImagenes
    })

    console.log('✅ Proceso de envío completado')
  } catch (error) {
    console.error('❌ ERROR CAPTURADO en handleSubmitCreacion:', error)
    alert(`Error capturado: ${error.message}`)
  } finally {
    console.log('🔄 Iniciando limpieza...')

    // Restaurar botón
    if (estadoOriginal) {
      submitBtn.textContent = estadoOriginal.texto
      submitBtn.disabled = estadoOriginal.deshabilitado
    }

    // Limpiar banderas inmediatamente
    window.procesoSubmitActivo = false
    window.submitInProgress = false
    console.log('🔓 Proceso de submit completado - Admin security reactivado')
  }
}

// ======================================================================
// INICIALIZACIÓN
// ======================================================================

/**
 * Inicializa la página de creación de productos
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando página de creación de productos (versión unificada)')

  // Verificar autenticación
  const admin = await requireAuth()
  if (!admin) return

  // Verificar elementos necesarios
  console.log('🔍 Verificación de elementos:')
  console.log('  - imageInput:', !!imageInput)
  console.log('  - previewContainer:', !!previewContainer)
  console.log('  - form:', !!form)

  // Configurar preview de imágenes
  if (imageInput && previewContainer) {
    configurarPreviewImagenes('imagenesCrear', 'previewImagenes', {
      maxFiles: 5,
      maxSizePerFile: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
    console.log('✅ Preview de imágenes configurado')
  }

  // Configurar campos dinámicos usando módulo unificado
  configurarCamposDinamicosProducto('tipoProducto', {
    alimento: 'camposAlimentoCrear',
    juguete: 'camposJugueteCrear'
  })
  console.log('✅ Campos dinámicos configurados')

  // Configurar envío del formulario
  if (form) {
    form.addEventListener('submit', handleSubmitCreacion)
    console.log('✅ Event listener del formulario configurado')

    // Agregar validación en tiempo real
    configurarValidacionTiempoReal()
    console.log('✅ Validación en tiempo real configurada')
  }

  // Configurar logout button
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      const { logout } = await import('../auth-guard.js')
      await logout()
    })
  }

  console.log('✅ Página inicializada correctamente con módulo unificado')
  console.log('💡 Funcionalidades cargadas:')
  console.log('  - ✅ Validación y envío unificado')
  console.log('  - ✅ Preview de imágenes modular')
  console.log('  - ✅ Campos dinámicos unificados')
  console.log('  - ✅ Feedback de UI modular')
})
