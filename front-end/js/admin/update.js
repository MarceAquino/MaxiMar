import { API_ROUTES, tokenUtils } from '../config/api.js'
import { requireAuth } from './auth-guard.js'

// Importar módulo unificado de formularios
import { mostrarErrores } from './utils/ui-utils.js'
import {
  configurarCamposDinamicosProducto,
  llenarFormularioProducto
} from './utils/unified-form-utils.js'

/**
 * Administrador de actualización de productos
 * Permite editar productos existentes
 * @module UpdateProduct
 */

const form = document.getElementById('formModificarProducto')

/**
 * Obtiene el ID del producto desde la URL
 * @returns {string|null} ID del producto
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
    const url = API_ROUTES.productoPorId(id)
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`No se pudo cargar el producto. Status: ${res.status}`)
    }

    const producto = await res.json()
    llenarFormularioProducto('formModificarProducto', producto)
  } catch (error) {
    mostrarErrores(['Error al cargar el producto: ' + error.message])
  }
}

/**
 * Maneja el envío del formulario de actualización
 * @param {Event} e - Evento del formulario
 */
async function handleSubmitActualizacion (e) {
  e.preventDefault()
  const id = getIdFromURL()
  const formData = new FormData(form)

  try {
    const authHeaders = tokenUtils.getAuthHeaders()
    const formDataProcessed = new FormData()

    // Procesar y validar datos del FormData
    for (const [key, value] of formData.entries()) {
      if (key === 'tipo_producto') {
        // El servidor espera 'categoria' en lugar de 'tipo_producto'
        formDataProcessed.append('categoria', value)
      } else if (key === 'precio') {
        const precio = parseFloat(value)
        if (isNaN(precio) || precio < 0.01) {
          throw new Error('El precio debe ser un número mayor o igual a 0.01')
        }
        formDataProcessed.append(key, precio.toString())
      } else if (key === 'stock') {
        const stock = parseInt(value)
        if (isNaN(stock) || stock < 0) {
          throw new Error('El stock debe ser un número igual o mayor a 0')
        }
        formDataProcessed.append(key, stock.toString())
      } else if (!key.endsWith('_display')) {
        // Omitir campos *_display que son solo para mostrar
        formDataProcessed.append(key, value)
      }
    }

    const response = await fetch(API_ROUTES.productoPorId(id), {
      method: 'PUT',
      headers: authHeaders,
      body: formDataProcessed
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al actualizar producto: ${response.status} - ${errorText}`)
    }

    await response.json()

    // Mostrar mensaje de éxito y redireccionar
    alert('Producto actualizado correctamente')
    window.location.href = '/front-end/html/admin/dashboard.html'
  } catch (error) {
    mostrarErrores(['Error al actualizar el producto: ' + error.message])
  }
}

/**
 * Inicialización de la página de actualización
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
      const { logout } = await import('./auth-guard.js')
      await logout()
    })
  }
})
