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
 * - Manejo de errores globales
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
 * Limpia los errores globales
 */
function limpiarErrores () {
  const erroresDiv = document.getElementById('erroresGlobales')
  if (erroresDiv) {
    erroresDiv.style.display = 'none'
    erroresDiv.innerHTML = ''
  }
}

/**
 * Muestra errores globales
 * @param {string|Array} errores - Error o array de errores
 */
function mostrarErrores (errores) {
  const erroresDiv = document.getElementById('erroresGlobales')
  if (!erroresDiv) return

  // Convertir a array si es string
  const erroresArray = Array.isArray(errores) ? errores : [errores]

  let html = ''
  erroresArray.forEach(error => {
    html += `<div class="mb-2"><i class="fas fa-exclamation-triangle me-2"></i>${error}</div>`
  })

  erroresDiv.innerHTML = html
  erroresDiv.style.display = 'block'

  // Scroll hacia arriba para mostrar los errores
  erroresDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

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
    mostrarErrores('Error al cargar el producto: ' + error.message)
  }
}

/**
 * Recopila todos los datos del formulario como objeto
 * @returns {Object} Datos del formulario
 */
function recopilarDatosFormulario () {
  const datos = {}
  const atributosEspecificos = {}

  // Obtener elementos del formulario
  const codigo = document.getElementById('codigo')?.value?.trim()
  const nombre = document.getElementById('nombre')?.value?.trim()
  const precio = document.getElementById('precio')?.value
  const marca = document.getElementById('marca')?.value?.trim()
  const stock = document.getElementById('stock')?.value
  const tipoProducto = document.getElementById('tipoProductoHidden')?.value ||
                       document.getElementById('tipoProducto')?.value
  const tipoMascota = document.getElementById('tipoMascotaHidden')?.value ||
                      document.getElementById('tipoMascota')?.value

  // Asignar datos básicos
  if (codigo) datos.codigo = codigo
  if (nombre) datos.nombre = nombre
  if (marca) datos.marca = marca
  if (tipoProducto) datos.categoria = tipoProducto
  if (tipoMascota) datos.tipo_mascota = tipoMascota

  // Validar y asignar precio
  if (precio) {
    const precioNum = parseFloat(precio)
    if (isNaN(precioNum) || precioNum < 0.01) {
      throw new Error('El precio debe ser un número mayor o igual a 0.01')
    }
    datos.precio = precioNum
  }

  // Validar y asignar stock
  if (stock) {
    const stockNum = parseInt(stock)
    if (isNaN(stockNum) || stockNum < 0) {
      throw new Error('El stock debe ser un número igual o mayor a 0')
    }
    datos.stock = stockNum
  }

  // Capturar atributos específicos según el tipo
  if (tipoProducto === 'alimento') {
    const edad = document.getElementById('edad')?.value?.trim()
    const peso = document.getElementById('peso')?.value?.trim()
    const sabor = document.getElementById('sabor')?.value?.trim()

    if (!edad) throw new Error('Debes seleccionar la edad para alimentos')
    if (!peso) throw new Error('Debes seleccionar el peso para alimentos')
    if (!sabor) throw new Error('Debes seleccionar el sabor para alimentos')

    atributosEspecificos.edad = edad
    atributosEspecificos.peso = peso
    atributosEspecificos.sabor = sabor
  } else if (tipoProducto === 'juguete') {
    const tamano = document.getElementById('tamano')?.value?.trim()
    const material = document.getElementById('material')?.value?.trim()

    if (!tamano) throw new Error('Debes seleccionar el tamaño para juguetes')
    if (!material) throw new Error('Debes seleccionar el material para juguetes')

    atributosEspecificos.tamano = tamano
    atributosEspecificos.material = material
  }

  // Agregar atributos específicos si existen
  if (Object.keys(atributosEspecificos).length > 0) {
    datos.atributos_especificos = atributosEspecificos
  }

  return datos
}

/**
 * Valida los datos del formulario
 * @param {Object} datos - Datos a validar
 * @returns {Array} Array de errores
 */
function validarDatos (datos) {
  const errores = []

  if (!datos.nombre || datos.nombre.length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres')
  }

  if (!datos.marca || datos.marca.length < 2) {
    errores.push('La marca debe tener al menos 2 caracteres')
  }

  if (!datos.categoria) {
    errores.push('Debe seleccionar un tipo de producto')
  }

  if (!datos.tipo_mascota) {
    errores.push('Debe seleccionar un tipo de mascota')
  }

  if (datos.precio !== undefined && (isNaN(datos.precio) || datos.precio < 0.01)) {
    errores.push('El precio debe ser un número mayor o igual a 0.01')
  }

  if (datos.stock !== undefined && (isNaN(datos.stock) || datos.stock < 0)) {
    errores.push('El stock debe ser un número igual o mayor a 0')
  }

  return errores
}

/**
 * Maneja el envío del formulario de actualización
 * @param {Event} e - Evento del formulario
 */
async function actualizarProducto (e) {
  e.preventDefault()
  limpiarErrores()

  const id = getIdFromURL()
  if (!id) {
    mostrarErrores('ID de producto no encontrado')
    return
  }

  try {
    // Recopilar datos del formulario y validar todo en un solo flujo
    const errores = []
    let datos = {}
    try {
      datos = recopilarDatosFormulario()
    } catch (err) {
      errores.push(err.message)
    }

    // Validar datos básicos
    if (Object.keys(datos).length > 0) {
      errores.push(...validarDatos(datos))
    }

    if (errores.length > 0) {
      mostrarErrores(errores)
      return
    }

    // Confirmación mediante modal
    const confirmar = await confirmarModal(
      'Modificar producto',
      '¿Estás seguro que desea modificar el producto?',
      'Modificar',
      'confirmar'
    )
    if (!confirmar) {
      return
    }

    // Enviar solicitud al servidor
    const response = await fetch(API_ROUTES.actualizarProducto(id), {
      method: 'PUT',
      headers: {
        ...tokenUtils.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })

    if (!response.ok) {
      const error = await response.json()
      mostrarErrores(error.error || `Error del servidor: ${response.status}`)
      return
    }

    // Mostrar mensaje de éxito
    alert(`¡Producto actualizado con éxito!\n\nEl producto "${datos.nombre}" ha sido actualizado correctamente.`)

    // Redirigir al dashboard después de un breve delay
    setTimeout(() => {
      window.location.href = '/front-end/html/admin/dashboard.html'
    }, 1000)
  } catch (error) {
    console.error('Error completo:', error)
    mostrarErrores(error.message || 'Error inesperado al actualizar el producto')
  }

  return false // Previene envío tradicional
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
    mostrarErrores('ID de producto no encontrado')
    setTimeout(() => {
      window.location.href = '/front-end/html/admin/dashboard.html'
    }, 2000)
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
