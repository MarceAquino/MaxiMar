/**
 * Administrador de actualización de productos
 *
 * FUNCIONALIDADES:
 * - Carga datos de producto existente
 * - Edición de productos con validación
 * - Manejo de atributos específicos por tipo
 * - Confirmación mediante modal
 * - Actualización en base de datos
 * - Redirección dashboard post-actualización
 *
 * DEPENDENCIAS:
 * - API_ROUTES: Endpoints de la API
 * - tokenUtils: Manejo de tokens
 * - modales.js: Confirmación mediante modal
 * - auth-guard.js: Protección de ruta
 * - unified-form-utils.js: Utilidades para formularios
 */

import { API_ROUTES, tokenUtils } from '../config/api.js'
import { confirmarModal } from '../utils/modales.js'
import { requireAuth } from './auth-guard.js'
import { configurarCamposDinamicosProducto, llenarFormularioProducto } from './utils/unified-form-utils.js'

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
    const res = await fetch(API_ROUTES.productoPorId(id))

    if (!res.ok) {
      throw new Error(`No se pudo cargar el producto. Status: ${res.status}`)
    }

    const producto = await res.json()
    llenarFormularioProducto('formModificarProducto', producto)
  } catch (error) {
    console.error('Error al cargar producto:', error)
    alert('Error al cargar el producto: ' + error.message)
  }
}

/**
 * Maneja el envío del formulario de actualización
 * @param {Event} e - Evento del formulario
 */
async function actualizarProducto (e) {
  e.preventDefault()
  const id = getIdFromURL()

  try {
    const authHeaders = {
      ...tokenUtils.getAuthHeaders(),
      'Content-Type': 'application/json'
    }

    // Recopilar datos del formulario como objeto simple
    const formData = new FormData(form)
    const datos = {}
    const atributosEspecificos = {}

    // Procesar datos básicos del formulario
    for (const [key, value] of formData.entries()) {
      if (key === 'precio') {
        const precio = parseFloat(value)
        if (isNaN(precio) || precio < 0.01) {
          throw new Error('El precio debe ser un número mayor o igual a 0.01')
        }
        datos.precio = precio
      } else if (key === 'stock') {
        const stock = parseInt(value)
        if (isNaN(stock) || stock < 0) {
          throw new Error('El stock debe ser un número igual o mayor a 0')
        }
        datos.stock = stock
      } else if (key === 'tipo_producto') {
        // El servidor espera 'categoria'
        datos.categoria = value
      } else if (key === 'edad' || key === 'peso' || key === 'sabor' || key === 'tamano' || key === 'material') {
        // Ignorar atributos específicos aquí - se capturan por separado
        continue
      } else if (!key.endsWith('_display') && !key.includes('Hidden')) {
        // Omitir campos de display y hidden
        datos[key] = value.trim()
      }
    }

    // Capturar atributos específicos según el tipo de producto
    const tipoProducto = datos.categoria || formData.get('tipoProductoHidden')

    if (tipoProducto === 'alimento') {
      // Capturar atributos de alimento
      const edadField = document.getElementById('edad')
      const pesoField = document.getElementById('peso')
      const saborField = document.getElementById('sabor')

      if (edadField && edadField.value && edadField.value.trim()) {
        atributosEspecificos.edad = edadField.value.trim()
      }
      if (pesoField && pesoField.value && pesoField.value.trim()) {
        atributosEspecificos.peso = pesoField.value.trim()
      }
      if (saborField && saborField.value && saborField.value.trim()) {
        atributosEspecificos.sabor = saborField.value.trim()
      }
    } else if (tipoProducto === 'juguete') {
      // Capturar atributos de juguete
      const tamanoField = document.getElementById('tamano')
      const materialField = document.getElementById('material')

      if (tamanoField && tamanoField.value && tamanoField.value.trim()) {
        atributosEspecificos.tamano = tamanoField.value.trim()
      }
      if (materialField && materialField.value && materialField.value.trim()) {
        atributosEspecificos.material = materialField.value.trim()
      }
    }

    // Agregar atributos específicos al objeto principal
    if (Object.keys(atributosEspecificos).length > 0) {
      datos.atributos_especificos = atributosEspecificos
    }

    // Validaciones básicas
    if (!datos.nombre || datos.nombre.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres')
    }
    if (!datos.marca || datos.marca.length < 2) {
      throw new Error('La marca debe tener al menos 2 caracteres')
    }

    // Creacion de modal para confirmar modificacion producto.
    const confirmar = await confirmarModal('Modificar producto', '¿Estás seguro que desea modificar el producto?', 'Modificar', 'confirmar')
    if (!confirmar) {
      return
    }

    const response = await fetch(API_ROUTES.actualizarProducto(id), {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(datos)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al actualizar producto: ${response.status} - ${errorText}`)
    }

    // Mostrar mensaje de éxito detallado
    alert(`¡Producto actualizado con éxito!\n\nEl producto "${datos.nombre}" ha sido actualizado correctamente.`)

    // Redirigir al dashboard después de un breve delay
    setTimeout(() => {
      window.location.href = '/front-end/html/admin/dashboard.html'
    }, 1000)
  } catch (error) {
    console.error('Error:', error)
    alert('Error al actualizar el producto: ' + error.message)
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
    alert('ID de producto no encontrado')
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
    form.addEventListener('submit', actualizarProducto)
  }
})
