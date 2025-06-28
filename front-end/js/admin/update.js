// ======================================================================
// ACTUALIZACIÓN DE PRODUCTOS - REFACTORIZADO CON MÓDULO COMPARTIDO
// ======================================================================
// Este archivo maneja la actualización de productos existentes
// Utiliza módulos compartidos para eliminar duplicación de código

import { API_ROUTES } from '../../config/api.js'
import { requireAuth } from '../auth-guard.js'

// Importar módulo unificado de formularios
import { mostrarErrores } from './utils/ui-utils.js'
import {
  configurarCamposDinamicosProducto,
  llenarFormularioProducto,
  manejarEnvioFormulario
} from './utils/unified-form-utils.js'

// ======================================================================
// VARIABLES GLOBALES
// ======================================================================
const form = document.getElementById('formModificarProducto')

// ======================================================================
// FUNCIONES DE UTILIDAD
// ======================================================================

/**
 * Obtiene el ID del producto desde la URL
 * @returns {string|null} ID del producto o null si no se encuentra
 */
function getIdFromURL () {
  const params = new URLSearchParams(window.location.search)
  return params.get('id')
}

/**
 * Carga los datos del producto desde el servidor
 * @param {string} id - ID del producto a cargar
 */
async function cargarProducto (id) {
  try {
    console.log(`🌐 Cargando producto con ID: ${id}`)
    const url = API_ROUTES.productoPorId(id)
    console.log(`🌐 URL de consulta: ${url}`)

    const res = await fetch(url)
    console.log('📡 Respuesta del servidor:', res.status, res.statusText)

    if (!res.ok) {
      throw new Error(`No se pudo cargar el producto. Status: ${res.status}`)
    }

    const producto = await res.json()
    console.log('📦 Datos del producto recibidos:', producto)

    // Usar función compartida para llenar el formulario
    llenarFormularioProducto('formModificarProducto', producto)
  } catch (error) {
    console.error('❌ Error al obtener producto:', error)
    mostrarErrores(['Error al cargar el producto: ' + error.message])
  }
}

// ======================================================================
// MANEJO DEL FORMULARIO
// ======================================================================

/**
 * Maneja el envío del formulario de actualización
 * @param {Event} e - Evento de submit
 */
async function handleSubmitActualizacion (e) {
  // Establecer bandera para evitar interferencias de admin-security
  window.procesoSubmitActivo = true
  console.log('🔒 Proceso de actualización activado - Admin security pausado')

  const id = getIdFromURL()

  try {
    await manejarEnvioFormulario(e, {
      esCreacion: false,
      productId: id,
      formId: 'formModificarProducto'
    })
  } finally {
    // Limpiar bandera después de un tiempo prudencial
    setTimeout(() => {
      window.procesoSubmitActivo = false
      console.log('🔓 Proceso de actualización completado - Admin security reactivado')
    }, 5000) // 5 segundos para asegurar que el usuario vea el feedback
  }
}

// ======================================================================
// INICIALIZACIÓN
// ======================================================================

/**
 * Inicializa la página de actualización
 */
document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAuth()
  if (!admin) return

  // Cargar producto
  const id = getIdFromURL()
  if (!id) {
    mostrarErrores(['ID de producto no encontrado'])
    window.location.href = '/front-end/html/admin/dashboard.html'
    return
  }

  await cargarProducto(id)

  // Configurar campos dinámicos usando módulo compartido
  configurarCamposDinamicosProducto('tipoProducto', {
    alimento: 'camposAlimento',
    juguete: 'camposJuguete'
  })

  // Configurar envío del formulario
  if (form) {
    form.addEventListener('submit', handleSubmitActualizacion)
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

  console.log('✅ Página de actualización inicializada con módulo unificado')
})
