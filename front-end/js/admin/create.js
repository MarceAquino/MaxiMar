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

    // Recopilar datos del formulario para mostrar en confirmación
    const originalFormData = new FormData(form)
    const datosProducto = {}
    const atributosEspecificos = {}

    for (const [key, value] of originalFormData.entries()) {
      if (key === 'precio') {
        const precio = parseFloat(value)
        if (isNaN(precio) || precio < 0.01) {
          throw new Error('El precio debe ser un número mayor o igual a 0.01')
        }
        datosProducto.precio = precio
      } else if (key === 'stock') {
        const stock = parseInt(value)
        if (isNaN(stock) || stock < 0) {
          throw new Error('El stock debe ser un número igual o mayor a 0')
        }
        datosProducto.stock = stock
      } else if (key === 'edad' || key === 'peso' || key === 'sabor' || key === 'tamano' || key === 'material') {
        // Ignorar atributos específicos aquí - se capturan por separado
        continue
      } else if (key === 'imagenes') {
        // IGNORAR imágenes aquí - se agregan manualmente después
        continue
      } else if (!key.endsWith('_display')) {
        datosProducto[key] = value
      }
    }

    // Capturar atributos específicos de campos visibles
    const tipoProducto = datosProducto.tipo_producto

    if (tipoProducto === 'alimento') {
      // Capturar atributos de alimento
      const edadField = document.getElementById('edadCrear')
      const pesoField = document.getElementById('pesoCrear')
      const saborField = document.getElementById('saborCrear')

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
      const tamanoField = document.getElementById('tamanoCrear')
      const materialField = document.getElementById('materialCrear')

      if (tamanoField && tamanoField.value && tamanoField.value.trim()) {
        atributosEspecificos.tamano = tamanoField.value.trim()
      }
      if (materialField && materialField.value && materialField.value.trim()) {
        atributosEspecificos.material = materialField.value.trim()
      }
    }

    // Agregar atributos específicos al objeto principal
    if (Object.keys(atributosEspecificos).length > 0) {
      datosProducto.atributos_especificos = JSON.stringify(atributosEspecificos)
    }

    console.log('Datos del producto:', datosProducto)
    console.log('Atributos específicos:', atributosEspecificos)

    // Validaciones adicionales antes de mostrar confirmación
    if (!datosProducto.codigo || datosProducto.codigo.trim().length < 3) {
      throw new Error('El código debe tener al menos 3 caracteres')
    }
    if (!datosProducto.nombre || datosProducto.nombre.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres')
    }
    if (!datosProducto.marca || datosProducto.marca.trim().length < 2) {
      throw new Error('La marca debe tener al menos 2 caracteres')
    }

    // Mensaje de confirmación con detalles del producto
    let mensajeConfirmacion = '¿Está seguro que desea crear este producto?\n\n' +
      `Código: ${datosProducto.codigo || 'N/A'} (debe ser único)\n` +
      `Nombre: ${datosProducto.nombre || 'N/A'}\n` +
      `Marca: ${datosProducto.marca || 'N/A'}\n` +
      `Precio: $${datosProducto.precio || 'N/A'}\n` +
      `Stock: ${datosProducto.stock || 'N/A'}\n` +
      `Tipo: ${datosProducto.tipo_producto || 'N/A'}\n` +
      `Mascota: ${datosProducto.tipo_mascota || 'N/A'}\n`

    // Agregar atributos específicos al mensaje
    if (Object.keys(atributosEspecificos).length > 0) {
      mensajeConfirmacion += '\nAtributos específicos:\n'
      Object.entries(atributosEspecificos).forEach(([key, value]) => {
        const nombreAtributo = {
          edad: 'Edad',
          peso: 'Peso',
          sabor: 'Sabor',
          tamano: 'Tamaño',
          material: 'Material'
        }[key] || key
        mensajeConfirmacion += `- ${nombreAtributo}: ${value}\n`
      })
    }

    mensajeConfirmacion += `\nImágenes: ${files.length} archivo(s)`

    const confirmacion = confirm(mensajeConfirmacion)

    if (!confirmacion) {
      return // Usuario canceló
    }

    // Proceder con la creación si confirma
    window.procesoSubmitActivo = true
    window.submitInProgress = true
    const submitBtn = form.querySelector('button[type="submit"]')
    deshabilitarBotonTemporal(submitBtn, 'Creando...', 10000)

    const formData = new FormData()

    // Agregar campos procesados al FormData
    Object.entries(datosProducto).forEach(([key, value]) => {
      if (key === 'precio' || key === 'stock') {
        formData.append(key, value.toString())
      } else {
        formData.append(key, value)
      }
    })

    // Agregar imágenes
    Array.from(files).forEach((file, index) => {
      formData.append('imagenes', file)
    })

    const response = await fetch(API_ROUTES.crearProducto, {
      method: 'POST',
      headers: authHeaders,
      body: formData
    })

    if (!response.ok) {
      let errorData
      const contentType = response.headers.get('content-type')

      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json()
        } else {
          // Si no es JSON, leer como texto
          const errorText = await response.text()
          errorData = { error: errorText || 'Error del servidor' }
        }
      } catch (parseError) {
        errorData = { error: 'Error del servidor - respuesta inválida' }
      }

      let mensajeError = 'Error al crear producto'

      if (errorData.error === 'Ya existe un producto con ese código') {
        mensajeError = `El código "${datosProducto.codigo}" ya existe. Por favor, use un código diferente.`
      } else if (errorData.detalles && Array.isArray(errorData.detalles)) {
        mensajeError = `Errores de validación:\n${errorData.detalles.join('\n')}`
      } else if (errorData.error) {
        mensajeError = errorData.error
      }

      throw new Error(mensajeError)
    }

    // Procesar respuesta exitosa
    let responseData
    try {
      responseData = await response.json()
    } catch (parseError) {
      throw new Error('Respuesta del servidor inválida')
    }

    // Verificar si la respuesta indica éxito
    if (!responseData.ok) {
      throw new Error(responseData.error || 'Error desconocido del servidor')
    }

    // Mensaje de éxito
    const producto = responseData.producto
    let mensajeExito = `¡Producto creado con éxito!\n\nEl producto "${datosProducto.nombre}" ha sido creado correctamente.`

    if (producto && producto.producto_id) {
      mensajeExito += `\nID del producto: ${producto.producto_id}`
    }

    alert(mensajeExito)

    // Limpiar formulario
    form.reset()
    previewContainer.innerHTML = ''
    previewContainer.style.display = 'none'

    // Redirigir al dashboard
    setTimeout(() => {
      window.location.href = '/front-end/html/admin/dashboard.html'
    }, 1000)
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    if (window.procesoSubmitActivo) {
      const submitBtn = form.querySelector('button[type="submit"]')
      if (submitBtn) {
        submitBtn.textContent = 'Crear Producto'
        submitBtn.disabled = false
      }
      window.procesoSubmitActivo = false
      window.submitInProgress = false
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAuth()
  if (!admin) return

  configurarCamposDinamicosProducto('tipoProducto', {
    alimento: 'camposAlimentoCrear',
    juguete: 'camposJugueteCrear'
  })

  // Event listener del formulario (solo una vez)
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
