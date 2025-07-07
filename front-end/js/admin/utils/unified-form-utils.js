/**
 * Utilidades para formularios de administracion
 *
 * FUNCIONALIDADES:
 * - Configuración dinámica de campos según tipo de producto
 * - Recopilación y validación de datos de formularios
 * - Llenado automático de formularios
 * - Manejo de envío de formularios (creación/actualización)
 * - Manejo de atributos específicos por tipo de producto
 *
 * DEPENDENCIAS:
 * - API_ROUTES: Configuración de endpoints API
 * - tokenUtils: Manejo de tokens de autenticación
 * - auth-guard.js: Funciones de autenticación
 */

import { API_ROUTES, tokenUtils } from '../../config/api.js'
import { logout } from '../auth-guard.js'

/**
 * Configura campos dinámicos que se muestran/ocultan según tipo de producto
 * @param {string} selectTipoId - ID del select que controla los campos
 * @param {Object} contenedores - Mapeo de tipos a IDs de contenedores
 */
export function configurarCamposDinamicosProducto (selectTipoId, contenedores) {
  const selectTipo = document.getElementById(selectTipoId)

  if (!selectTipo) {
    return
  }

  function actualizarCampos () {
    const tipoSeleccionado = selectTipo.value

    // Ocultar todos los contenedores
    Object.values(contenedores).forEach(containerId => {
      const container = document.getElementById(containerId)
      if (container) container.style.display = 'none'
    })

    // Mostrar el contenedor apropiado
    if (tipoSeleccionado && contenedores[tipoSeleccionado]) {
      const container = document.getElementById(contenedores[tipoSeleccionado])
      if (container) container.style.display = 'block'
    }
  }

  selectTipo.addEventListener('change', actualizarCampos)
  actualizarCampos()
}

/**
 * Recopila datos del formulario de administrador
 * @returns {Object} Datos del formulario (nombre, email, contraseñas)
 * @throws {Error} Si faltan campos requeridos
 */
export function recopilarDatosAdmin () {
  // IDs fijos de los inputs
  const nombreInput = document.getElementById('nombreAdmin')
  const emailInput = document.getElementById('emailAdmin')
  const passwordInput = document.getElementById('passwordAdmin')
  const confirmInput = document.getElementById('confirmPasswordAdmin')

  // Comprobaciones mínimas para evitar null‑pointer
  if (!nombreInput || !emailInput || !passwordInput || !confirmInput) {
    throw new Error('Uno o más campos del formulario de administrador no fueron encontrados')
  }

  return {
    nombre: nombreInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    confirmarPassword: confirmInput.value
  }
}

/**
 * Recopila y estructura datos de producto desde un formulario
 * @param {string} formId - ID del formulario
 * @returns {Object} Datos del producto con atributos específicos
 * @throws {Error} Si el formulario no existe
 */
export function recopilarDatosProducto (formId) {
  const form = document.getElementById(formId)
  if (!form) throw new Error(`Formulario '${formId}' no encontrado`)

  const formData = new FormData(form)

  const datos = {
    codigo: formData.get('codigo')?.trim(),
    nombre: formData.get('nombre')?.trim(),
    tipoProducto: formData.get('tipo_producto'),
    tipoMascota: formData.get('tipo_mascota'),
    precio: parseFloat(formData.get('precio')),
    marca: formData.get('marca')?.trim(),
    stock: parseInt(formData.get('stock')),
    atributosEspecificos: {}
  }

  // Atributos específicos para alimentos
  if (datos.tipoProducto === 'alimento') {
    const edad = formData.get('edad')
    const peso = formData.get('peso')
    const sabor = formData.get('sabor')

    if (edad) datos.atributosEspecificos.edad = edad
    if (peso) datos.atributosEspecificos.peso = peso
    if (sabor) datos.atributosEspecificos.sabor = sabor
  }

  // Atributos específicos para juguetes
  if (datos.tipoProducto === 'juguete') {
    const tamano = formData.get('tamano')
    const material = formData.get('material')

    if (tamano) datos.atributosEspecificos.tamano = tamano
    if (material) datos.atributosEspecificos.material = material
  }

  return datos
}

/**
 * Valida los datos básicos de un producto
 * @param {Object} datos - Datos del producto a validar
 * @returns {Array} Lista de errores encontrados
 */
export function validarDatosProducto (datos) {
  const errores = []

  // Validaciones básicas
  if (!datos.codigo || datos.codigo.length < 3) {
    errores.push('El código debe tener al menos 3 caracteres')
  }

  if (!datos.nombre || datos.nombre.length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres')
  }

  if (!datos.tipoProducto) {
    errores.push('El tipo de producto es obligatorio')
  }

  if (!datos.tipoMascota) {
    errores.push('El tipo de mascota es obligatorio')
  }

  if (!datos.marca || datos.marca.length < 2) {
    errores.push('La marca debe tener al menos 2 caracteres')
  }

  if (isNaN(datos.precio) || datos.precio <= 0) {
    errores.push('El precio debe ser un número mayor a 0')
  }

  if (isNaN(datos.stock) || datos.stock < 0) {
    errores.push('El stock debe ser un número mayor o igual a 0')
  }

  return errores
}

/**
 * Llena un formulario con los datos de un producto existente
 * @param {string} formId - ID del formulario
 * @param {Object} producto - Datos del producto
 */
export function llenarFormularioProducto (formId, producto) {
  const form = document.getElementById(formId)
  if (!form) {
    return
  }

  try {
    // Campos básicos
    const campos = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      marca: producto.marca,
      stock: producto.stock
    }

    // Llenar campos básicos
    Object.entries(campos).forEach(([nombre, valor]) => {
      const campo = form.querySelector(`[name="${nombre}"]`)
      if (campo && valor !== undefined && valor !== null) {
        campo.value = valor
      }
    })

    // MANEJO ESPECIAL PARA UPDATE (campos disabled)
    if (formId === 'formModificarProducto') {
      // Tipo de producto
      const tipoProductoDisplay = form.querySelector('#tipoProducto')
      const tipoProductoHidden = form.querySelector('#tipoProductoHidden')

      if (tipoProductoDisplay && producto.categoria) {
        tipoProductoDisplay.value = producto.categoria
      }
      if (tipoProductoHidden && producto.categoria) {
        tipoProductoHidden.value = producto.categoria
      }

      // Tipo de mascota
      const tipoMascotaDisplay = form.querySelector('#tipoMascota')
      const tipoMascotaHidden = form.querySelector('#tipoMascotaHidden')

      if (tipoMascotaDisplay && producto.tipo_mascota) {
        tipoMascotaDisplay.value = producto.tipo_mascota
      }
      if (tipoMascotaHidden && producto.tipo_mascota) {
        tipoMascotaHidden.value = producto.tipo_mascota
      }
    } else {
      // Para formulario de creación
      const tipoProducto = form.querySelector('[name="tipo_producto"]')
      const tipoMascota = form.querySelector('[name="tipo_mascota"]')

      if (tipoProducto && producto.categoria) {
        tipoProducto.value = producto.categoria
      }
      if (tipoMascota && producto.tipo_mascota) {
        tipoMascota.value = producto.tipo_mascota
      }
    }

    // Disparar evento para mostrar campos dinámicos
    const selectTipo = form.querySelector('#tipoProducto') || form.querySelector('[name="tipo_producto"]')
    if (selectTipo) {
      selectTipo.dispatchEvent(new Event('change'))
    }

    // Atributos específicos
    if (producto.atributos_especificos) {
      let atributos = producto.atributos_especificos

      // Si viene como string JSON, parsearlo
      if (typeof atributos === 'string') {
        try {
          atributos = JSON.parse(atributos)
        } catch (error) {
          atributos = {}
        }
      }

      Object.entries(atributos).forEach(([atributo, valor]) => {
        const campo = form.querySelector(`[name="${atributo}"]`)
        if (campo && valor !== undefined && valor !== null) {
          campo.value = valor
        }
      })
    }
  } catch (error) {
    // Error silencioso
  }
}

// Maneja el envío del formulario de productos (creación/actualización)
export async function manejarEnvioFormulario (e, options = {}) {
  e.preventDefault()

  const {
    esCreacion = true,
    productId = null,
    formId = 'formCrearProducto',
    obtenerImagenes = null
  } = options

  try {
    // 1. Recopilar y validar datos
    const datos = recopilarDatosProducto(formId)
    const errores = validarDatosProducto(datos)

    // 2. Validar imágenes para creación
    if (esCreacion && obtenerImagenes) {
      const imagenes = obtenerImagenes()
      if (!imagenes || imagenes.length === 0) {
        errores.push('Debe seleccionar al menos una imagen')
      }
    }

    if (errores.length > 0) {
      alert('Errores encontrados:\n\n' + errores.map((e, i) => `${i + 1}. ${e}`).join('\n'))
      return
    }

    // 3. Confirmación
    const accion = esCreacion ? 'crear' : 'actualizar'
    const confirmacion = confirm(
      `¿Está seguro que desea ${accion} este producto?\n\n` +
      `Nombre: ${datos.nombre}\n` +
      `Código: ${datos.codigo}\n` +
      `Precio: $${datos.precio}`
    )

    if (!confirmacion) {
      return
    }

    // 4. Preparar datos para envío
    const headers = { ...tokenUtils.getAuthHeaders() }
    let bodyData

    if (esCreacion && obtenerImagenes) {
      // FormData para crear con imágenes
      const formData = new FormData()
      formData.append('codigo', datos.codigo)
      formData.append('nombre', datos.nombre)
      formData.append('categoria', datos.tipoProducto)
      formData.append('tipo_mascota', datos.tipoMascota)
      formData.append('precio', datos.precio)
      formData.append('marca', datos.marca)
      formData.append('stock', datos.stock)
      formData.append('atributos_especificos', JSON.stringify(datos.atributosEspecificos))

      const imagenes = obtenerImagenes()
      Array.from(imagenes).forEach(imagen => {
        formData.append('imagenes', imagen)
      })

      bodyData = formData
    } else {
      // JSON para actualizar
      headers['Content-Type'] = 'application/json'
      bodyData = JSON.stringify({
        codigo: datos.codigo,
        nombre: datos.nombre,
        categoria: datos.tipoProducto,
        tipo_mascota: datos.tipoMascota,
        precio: datos.precio,
        marca: datos.marca,
        stock: datos.stock,
        atributos_especificos: datos.atributosEspecificos
      })
    }

    // 5. Enviar petición
    const url = esCreacion ? API_ROUTES.crearProducto : API_ROUTES.actualizarProducto(productId)
    const method = esCreacion ? 'POST' : 'PUT'

    const response = await fetch(url, { method, headers, body: bodyData })

    if (response.status === 401) {
      await logout()
      return
    }

    const result = await response.json()

    if (!response.ok) {
      let mensaje = result.message || 'Error en el servidor'

      if (result.error === 'Ya existe un producto con ese código') {
        mensaje = 'Ya existe un producto con ese código. Use un código diferente.'
      }

      alert(`Error: ${mensaje}`)
      return
    }

    // 6. Manejar éxito
    const nombreProducto = datos.nombre

    if (esCreacion) {
      // Flujo para creación - Solo éxito y limpieza automática
      alert(`El producto "${nombreProducto}" ha sido creado correctamente.`)

      // Limpiar formulario automáticamente
      const form = document.getElementById(formId)
      if (form) {
        form.reset()
        const preview = document.getElementById('preview-container')
        if (preview) {
          preview.innerHTML = ''
          preview.style.display = 'none'
        }
      }
    } else {
      // Flujo para actualización
      alert(`El producto "${nombreProducto}" ha sido actualizado correctamente.`)
      setTimeout(() => {
        window.location.replace('dashboard.html')
      }, 500)
    }
  } catch (error) {
    alert('Error de conexión. Verifique su conexión e intente nuevamente.')
  }
}

// Reactiva un formulario después de envío
export function reactivarFormulario () {
  const submitBtn = document.querySelector('button[type="submit"]')
  if (submitBtn) {
    submitBtn.disabled = false
    submitBtn.textContent = submitBtn.dataset.originalText || 'Enviar'
  }

  if (window.procesoSubmitActivo !== undefined) {
    window.procesoSubmitActivo = false
  }
}
