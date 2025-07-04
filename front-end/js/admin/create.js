import { API_ROUTES, tokenUtils } from '../config/api.js'
import { requireAuth } from './auth-guard.js'
import { configurarCamposDinamicosProducto } from './utils/unified-form-utils.js'

const form = document.getElementById('formCrearProducto')
const imageInput = document.getElementById('imagenesCrear')
const previewContainer = document.getElementById('previewImagenes')

// Mostrar preview de imágenes
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

// Validar imágenes básicas
function validarImagenes (files) {
  if (!files.length) return ['Selecciona al menos una imagen']
  if (files.length > 5) return ['Máximo 5 imágenes']

  const errores = []
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      errores.push(`${file.name} no es una imagen`)
    }
    if (file.size > 5 * 1024 * 1024) {
      errores.push(`${file.name} es muy grande (máximo 5MB)`)
    }
  })
  return errores
}

// Event listener para preview
if (imageInput) {
  imageInput.addEventListener('change', (e) => {
    const files = e.target.files
    const errores = validarImagenes(files)
    if (errores.length) {
      alert(errores.join('\n'))
      imageInput.value = ''
      previewContainer.style.display = 'none'
      return
    }
    mostrarPreview(files)
  })
}

// Función principal para crear producto
async function crearProducto (e) {
  e.preventDefault()

  try {
    const files = imageInput.files
    const errores = validarImagenes(files)
    if (errores.length) {
      alert(errores.join('\n'))
      return
    }

    // Sincronizar categoría
    const tipoProducto = document.getElementById('tipoProducto')
    const categoria = document.getElementById('categoriaCrear')
    if (tipoProducto && categoria) {
      categoria.value = tipoProducto.value
    }

    // Crear FormData con todos los campos del formulario
    const formData = new FormData(form)

    // Agregar atributos específicos si existen
    const atributos = {}
    if (tipoProducto.value === 'alimento') {
      const edad = document.getElementById('edadCrear')?.value
      const peso = document.getElementById('pesoCrear')?.value
      const sabor = document.getElementById('saborCrear')?.value
      if (edad) atributos.edad = edad
      if (peso) atributos.peso = peso
      if (sabor) atributos.sabor = sabor
    } else if (tipoProducto.value === 'juguete') {
      const tamano = document.getElementById('tamanoCrear')?.value
      const material = document.getElementById('materialCrear')?.value
      if (tamano) atributos.tamano = tamano
      if (material) atributos.material = material
    }

    if (Object.keys(atributos).length > 0) {
      formData.set('atributos_especificos', JSON.stringify(atributos))
    }

    // Confirmar creación
    const codigo = formData.get('codigo')
    const nombre = formData.get('nombre')
    const precio = formData.get('precio')

    if (!confirm(`¿Crear producto "${nombre}" con código "${codigo}" y precio $${precio}?`)) {
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
      throw new Error(error.error || 'Error del servidor')
    }

    const resultado = await response.json()
    alert(`Producto creado exitosamente! ID: ${resultado.producto.producto_id}`)

    // Limpiar y redirigir
    form.reset()
    previewContainer.innerHTML = ''
    previewContainer.style.display = 'none'
    window.location.href = '/front-end/html/admin/dashboard.html'
  } catch (error) {
    alert(`Error: ${error.message}`)
  }
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

  // Logout
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      const { logout } = await import('./auth-guard.js')
      await logout()
    })
  }
})
