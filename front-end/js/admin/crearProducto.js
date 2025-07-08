/**
 * Módulo de creación de productos en el panel de administración
 *
 * FUNCIONALIDAD PRINCIPAL:
 * - Permite validar y crear nuevos productos desde el formulario HTML.
 * - Valida campos básicos y atributos específicos según el tipo de producto.
 * - Muestra errores detallados en la interfaz en caso de validaciones fallidas.
 * - Muestra vista previa de las imágenes seleccionadas.
 * - Envía el producto al servidor utilizando FormData y autenticación.
 * - Redirige al dashboard luego de una creación exitosa.
 *
 * DEPENDENCIAS:
 * - API_ROUTES y tokenUtils: Para hacer peticiones autenticadas a la API
 * - modales.js: Para confirmar acciones mediante un modal
 * - auth-guard.js: Para restringir acceso solo a usuarios autenticados
 * - unified-form-utils.js: Para manejar campos dinámicos según tipo de producto
 */

import { API_ROUTES, tokenUtils } from '../config/api.js'
import { confirmarModal } from '../utils/modales.js'
import { requireAuth } from './auth-guard.js'
import { configurarCamposDinamicosProducto } from './utils/unified-form-utils.js'

const form = document.getElementById('formCrearProducto')
const imageInput = document.getElementById('imagenesCrear')
const previewContainer = document.getElementById('previewImagenes')

// Contenedor para mostrar errores en HTML
const contenedorErrores = document.getElementById('erroresGlobales')

/**
 * Muestra mensajes de error en el contenedor HTML
 * @param {Array|string} errores - Lista o texto con errores
 */
function mostrarErrores (errores) {
  if (!contenedorErrores) return

  contenedorErrores.innerHTML = ''

  if (typeof errores === 'string') {
    errores = [errores]
  }

  const ul = document.createElement('ul')
  ul.classList.add('alert', 'alert-danger', 'p-2')
  errores.forEach(error => {
    const li = document.createElement('li')
    li.textContent = error
    ul.appendChild(li)
  })

  contenedorErrores.appendChild(ul)
  contenedorErrores.style.display = 'block'
}

/**
 * Limpia el contenedor de errores
 */
function limpiarErrores () {
  if (!contenedorErrores) return
  contenedorErrores.innerHTML = ''
  contenedorErrores.style.display = 'none'
}

/**
 * Muestra preview de las imágenes seleccionadas
 * @param {FileList} files - Archivos de imagen seleccionados
 */
function mostrarPreview (files) {
  previewContainer.innerHTML = ''
  if (!files.length) {
    previewContainer.style.display = 'none'
    return
  }

  previewContainer.style.display = 'flex'
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const img = document.createElement('img')
      img.src = e.target.result
      img.style.width = '100px'
      img.style.height = '100px'
      img.style.objectFit = 'cover'
      img.style.margin = '5px'
      img.style.border = '2px solid green'
      previewContainer.appendChild(img)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Valida las imágenes seleccionadas
 * @param {FileList} files - Archivos a validar
 * @returns {Array} Lista de errores encontrados
 */
function validarImagenes (files) {
  const errores = []
  if (!files.length) errores.push('Selecciona al menos una imagen')
  if (files.length > 5) errores.push('Máximo 5 imágenes')

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      errores.push(`${file.name} no es una imagen válida`)
    }
    if (file.size > 5 * 1024 * 1024) {
      errores.push(`${file.name} es muy grande (máximo 5MB)`)
    }
  })
  return errores
}

// Evento para mostrar preview al seleccionar imágenes
if (imageInput) {
  imageInput.addEventListener('change', (e) => {
    limpiarErrores()
    const files = e.target.files
    const errores = validarImagenes(files)
    if (errores.length) {
      mostrarErrores(errores)
      imageInput.value = ''
      previewContainer.style.display = 'none'
      return
    }
    mostrarPreview(files)
  })
}

/**
 * Procesa el formulario y crea un nuevo producto
 * @param {Event} e - Evento de submit del formulario
 */
async function crearProducto (e) {
  e.preventDefault()
  limpiarErrores()

  try {
    const files = imageInput.files
    const errores = []
    // Validar imágenes
    errores.push(...validarImagenes(files))

    // Validar campos básicos (incluyendo código)
    const codigo = document.getElementById('codigoCrear')?.value?.trim()
    const nombre = document.getElementById('nombreCrear')?.value?.trim()
    const marca = document.getElementById('marcaCrear')?.value?.trim()
    const precio = document.getElementById('precioCrear')?.value
    const stock = document.getElementById('stockCrear')?.value
    const tipoProducto = document.getElementById('tipoProducto')
    const categoria = document.getElementById('categoriaCrear')
    if (tipoProducto && categoria) {
      categoria.value = tipoProducto.value
    }

    // Validaciones según requerimiento
    if (!codigo || codigo.length < 3) {
      errores.push('El código debe tener entre 3 y 20 caracteres.')
    } else if (codigo.length > 20) {
      errores.push('El código debe tener entre 3 y 20 caracteres.')
    }
    if (!nombre || nombre.length < 3) {
      errores.push('El nombre debe tener entre 3 y 100 caracteres.')
    } else if (nombre.length > 100) {
      errores.push('El nombre debe tener entre 3 y 100 caracteres.')
    }
    if (!marca || marca.length < 2) {
      errores.push('La marca debe tener entre 2 y 50 caracteres.')
    } else if (marca.length > 50) {
      errores.push('La marca debe tener entre 2 y 50 caracteres.')
    }
    if (!tipoProducto?.value) errores.push('Debes seleccionar un tipo de producto.')
    if (!document.getElementById('tipoMascotaCrear')?.value) errores.push('Debes seleccionar un tipo de mascota.')
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0.01) errores.push('El precio debe ser un número mayor o igual a 0.01.')
    if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) errores.push('El stock debe ser un número igual o mayor a 0.')

    // Validar atributos específicos obligatorios
    const atributosObj = {}
    if (tipoProducto?.value === 'alimento') {
      const edad = document.getElementById('edadCrear')?.value?.trim()
      const peso = document.getElementById('pesoCrear')?.value?.trim()
      const sabor = document.getElementById('saborCrear')?.value?.trim()
      if (!edad) errores.push('El campo "edad" es obligatorio para productos de tipo alimento.')
      if (!peso) errores.push('El campo "peso" es obligatorio para productos de tipo alimento.')
      if (!sabor) errores.push('El campo "sabor" es obligatorio para productos de tipo alimento.')
      if (edad && peso && sabor) {
        atributosObj.edad = edad
        atributosObj.peso = peso
        atributosObj.sabor = sabor
      }
    } else if (tipoProducto?.value === 'juguete') {
      const tamano = document.getElementById('tamanoCrear')?.value?.trim()
      const material = document.getElementById('materialCrear')?.value?.trim()
      if (!tamano) errores.push('El campo "tamaño" es obligatorio para productos de tipo juguete.')
      if (!material) errores.push('El campo "material" es obligatorio para productos de tipo juguete.')
      if (tamano && material) {
        atributosObj.tamano = tamano
        atributosObj.material = material
      }
    }

    if (errores.length > 0) {
      mostrarErrores(errores)
      return
    }

    // Crear FormData con todos los campos del formulario
    const formData = new FormData(form)
    if (Object.keys(atributosObj).length > 0) {
      formData.set('atributos_especificos', JSON.stringify(atributosObj))
    }

    // Confirmar creación de producto con modal
    const confirmar = await confirmarModal(
      'Crear Producto',
      '¿Estás seguro que desea crear el producto?',
      'Crear',
      'confirmar'
    )
    if (!confirmar) {
      return
    }

    // Enviar al servidor
    const response = await fetch(API_ROUTES.crearProducto, {
      method: 'POST',
      headers: tokenUtils.getAuthHeaders(),
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      mostrarErrores(error.error || 'Error del servidor')
      return
    }

    const resultado = await response.json()

    // Mensaje éxito (podés reemplazar alert por mostrar en HTML si querés)
    alert(`Producto creado exitosamente! ID: ${resultado.producto.producto_id}`)

    // Limpiar formulario y preview
    form.reset()
    previewContainer.innerHTML = ''
    previewContainer.style.display = 'none'

    // Redirigir después de 1 seg
    setTimeout(() => {
      window.location.href = '/front-end/html/admin/dashboard.html'
    }, 1000)
  } catch (error) {
    console.error('Error completo:', error)
    mostrarErrores(error.message || 'Error inesperado')
  }

  return false // Previene envío tradicional
}

// Configurar página
document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAuth()
  if (!admin) return

  // Configurar campos dinámicos
  configurarCamposDinamicosProducto('tipoProducto', {
    alimento: 'camposAlimentoCrear',
    juguete: 'camposJugueteCrear'
  })

  // Event listener del formulario
  if (form) {
    form.addEventListener('submit', crearProducto)
  }
})
