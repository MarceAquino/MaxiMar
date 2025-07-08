/* FUNCIONALIDADES:
* - Validaciones básicas: código, nombre, marca, precio, stock, tipo, mascota
* - Validaciones específicas por tipo: alimento (edad, peso, sabor), juguete (tamaño, material)
* - Validación y preview de imágenes (hasta 5, tipo imagen, máx. 5MB)
* - Modal de confirmación antes de enviar
* - Envío autenticado con token
*
* DEPENDENCIAS:
* - `api.js` (rutas y tokens)
* - `modales.js` (confirmación modal)
* - `auth-guard.js` (protección de acceso)
* - `unified-form-utils.js` (campos dinámicos según tipo de producto)
*/

import { API_ROUTES, tokenUtils } from '../config/api.js'
import { confirmarModal } from '../utils/modales.js'
import { requireAuth } from './auth-guard.js'
import { configurarCamposDinamicosProducto } from './utils/unified-form-utils.js'

// Elementos principales del formulario
const form = document.getElementById('formCrearProducto')
const imageInput = document.getElementById('imagenesCrear')
const previewContainer = document.getElementById('previewImagenes')
const contenedorErrores = document.getElementById('erroresGlobales')

// Mostrar errores en pantalla
function mostrarErrores (errores) {
  if (!contenedorErrores) return
  contenedorErrores.innerHTML = ''
  const arr = Array.isArray(errores) ? errores : [errores]
  const ul = document.createElement('ul')
  ul.className = 'alert alert-danger p-2'
  arr.forEach(e => { const li = document.createElement('li'); li.textContent = e; ul.appendChild(li) })
  contenedorErrores.appendChild(ul)
  contenedorErrores.style.display = 'block'
}

// Limpiar errores visuales
function limpiarErrores () {
  if (!contenedorErrores) return
  contenedorErrores.innerHTML = ''
  contenedorErrores.style.display = 'none'
}

// Mostrar preview de imágenes seleccionadas
function mostrarPreview (files) {
  previewContainer.innerHTML = ''
  if (!files.length) { previewContainer.style.display = 'none'; return }
  previewContainer.style.display = 'flex'
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = document.createElement('img')
      img.src = e.target.result
      img.style.width = '100px'; img.style.height = '100px'; img.style.objectFit = 'cover'; img.style.margin = '5px'; img.style.border = '2px solid green'
      previewContainer.appendChild(img)
    }
    reader.readAsDataURL(file)
  })
}

// Validar imágenes seleccionadas
function validarImagenes (files) {
  const errores = []
  if (!files.length) errores.push('Selecciona al menos una imagen')
  if (files.length > 5) errores.push('Máximo 5 imágenes')
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) errores.push(`${file.name} no es una imagen válida`)
    if (file.size > 5 * 1024 * 1024) errores.push(`${file.name} es muy grande (máximo 5MB)`)
  })
  return errores
}

// Evento para mostrar preview al seleccionar imágenes
if (imageInput) {
  imageInput.addEventListener('change', e => {
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

// Procesar formulario y crear producto
async function crearProducto (e) {
  e.preventDefault()
  limpiarErrores()
  try {
    const files = imageInput.files
    const errores = [...validarImagenes(files)]
    // Validar campos básicos
    const codigo = document.getElementById('codigoCrear')?.value?.trim()
    const nombre = document.getElementById('nombreCrear')?.value?.trim()
    const marca = document.getElementById('marcaCrear')?.value?.trim()
    const precio = document.getElementById('precioCrear')?.value
    const stock = document.getElementById('stockCrear')?.value
    const tipoProducto = document.getElementById('tipoProducto')
    const categoria = document.getElementById('categoriaCrear')
    if (tipoProducto && categoria) categoria.value = tipoProducto.value
    if (!codigo || codigo.length < 3 || codigo.length > 20) errores.push('El código debe tener entre 3 y 20 caracteres.')
    if (!nombre || nombre.length < 3 || nombre.length > 100) errores.push('El nombre debe tener entre 3 y 100 caracteres.')
    if (!marca || marca.length < 2 || marca.length > 50) errores.push('La marca debe tener entre 2 y 50 caracteres.')
    if (!tipoProducto?.value) errores.push('Debes seleccionar un tipo de producto.')
    if (!document.getElementById('tipoMascotaCrear')?.value) errores.push('Debes seleccionar un tipo de mascota.')
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0.01) errores.push('El precio debe ser un número mayor o igual a 0.01.')
    if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) errores.push('El stock debe ser un número igual o mayor a 0.')
    // Validar atributos específicos
    const atributosObj = {}
    if (tipoProducto?.value === 'alimento') {
      const edad = document.getElementById('edadCrear')?.value?.trim()
      const peso = document.getElementById('pesoCrear')?.value?.trim()
      const sabor = document.getElementById('saborCrear')?.value?.trim()
      if (!edad) errores.push('El campo "edad" es obligatorio para productos de tipo alimento.')
      if (!peso) errores.push('El campo "peso" es obligatorio para productos de tipo alimento.')
      if (!sabor) errores.push('El campo "sabor" es obligatorio para productos de tipo alimento.')
      if (edad && peso && sabor) { atributosObj.edad = edad; atributosObj.peso = peso; atributosObj.sabor = sabor }
    } else if (tipoProducto?.value === 'juguete') {
      const tamano = document.getElementById('tamanoCrear')?.value?.trim()
      const material = document.getElementById('materialCrear')?.value?.trim()
      if (!tamano) errores.push('El campo "tamaño" es obligatorio para productos de tipo juguete.')
      if (!material) errores.push('El campo "material" es obligatorio para productos de tipo juguete.')
      if (tamano && material) { atributosObj.tamano = tamano; atributosObj.material = material }
    }
    if (errores.length) { mostrarErrores(errores); return }
    // Crear FormData con todos los campos
    const formData = new FormData(form)
    if (Object.keys(atributosObj).length) formData.set('atributos_especificos', JSON.stringify(atributosObj))
    // Confirmar acción
    const ok = await confirmarModal('Crear Producto', '¿Estás seguro que desea crear el producto?', 'Crear', 'confirmar')
    if (!ok) return
    // Enviar al backend
    const r = await fetch(API_ROUTES.crearProducto, {
      method: 'POST',
      headers: tokenUtils.getAuthHeaders(),
      body: formData
    })
    if (!r.ok) {
      const error = await r.json()
      mostrarErrores(error.error || 'Error del servidor')
      return
    }
    const resultado = await r.json()
    alert(`Producto creado exitosamente! ID: ${resultado.producto.producto_id}`)
    form.reset()
    previewContainer.innerHTML = ''
    previewContainer.style.display = 'none'
    setTimeout(() => { window.location.href = '/front-end/html/admin/dashboard.html' }, 1000)
  } catch (e) {
    mostrarErrores(e.message || 'Error inesperado')
  }
  return false
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  // Proteger ruta: solo admin logueado
  const admin = await requireAuth()
  if (!admin) return
  // Configurar campos dinámicos según tipo
  configurarCamposDinamicosProducto('tipoProducto', { alimento: 'camposAlimentoCrear', juguete: 'camposJugueteCrear' })
  // Listener de envío de formulario
  if (form) form.addEventListener('submit', crearProducto)
})
