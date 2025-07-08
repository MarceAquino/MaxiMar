// --- Modificar producto (versión simplificada y comentada para estudiantes) ---
import { API_ROUTES, tokenUtils } from '../config/api.js'
import { confirmarModal } from '../utils/modales.js'
import { requireAuth } from './auth-guard.js'
import { configurarCamposDinamicosProducto, llenarFormularioProducto } from './utils/unified-form-utils.js'

// Limpiar errores globales
function limpiarErrores () {
  const div = document.getElementById('erroresGlobales')
  if (div) { div.style.display = 'none'; div.innerHTML = '' }
}

// Mostrar errores globales
function mostrarErrores (errores) {
  const div = document.getElementById('erroresGlobales')
  if (!div) return
  const arr = Array.isArray(errores) ? errores : [errores]
  div.innerHTML = arr.map(e => `<div class="mb-2"><i class="fas fa-exclamation-triangle me-2"></i>${e}</div>`).join('')
  div.style.display = 'block'
  div.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// Obtener ID de producto desde la URL
function getIdFromURL () {
  return new URLSearchParams(window.location.search).get('id')
}

// Cargar datos del producto y llenar el formulario
async function cargarProducto (id) {
  try {
    const res = await fetch(API_ROUTES.productoPorId(id))
    if (!res.ok) throw new Error('No se pudo cargar el producto')
    const producto = await res.json()
    llenarFormularioProducto('formModificarProducto', producto)
  } catch (e) {
    mostrarErrores('Error al cargar el producto: ' + e.message)
  }
}

// Recopilar datos del formulario (incluye validación básica y atributos específicos)
function recopilarDatosFormulario () {
  const datos = {}
  const tipoProducto = document.getElementById('tipoProductoHidden')?.value || document.getElementById('tipoProducto')?.value
  const tipoMascota = document.getElementById('tipoMascotaHidden')?.value || document.getElementById('tipoMascota')?.value
  if (document.getElementById('codigo')?.value) datos.codigo = document.getElementById('codigo').value.trim()
  if (document.getElementById('nombre')?.value) datos.nombre = document.getElementById('nombre').value.trim()
  if (document.getElementById('marca')?.value) datos.marca = document.getElementById('marca').value.trim()
  if (tipoProducto) datos.categoria = tipoProducto
  if (tipoMascota) datos.tipo_mascota = tipoMascota
  if (document.getElementById('precio')?.value) {
    const p = parseFloat(document.getElementById('precio').value)
    if (isNaN(p) || p < 0.01) throw new Error('El precio debe ser mayor a 0.01')
    datos.precio = p
  }
  if (document.getElementById('stock')?.value) {
    const s = parseInt(document.getElementById('stock').value)
    if (isNaN(s) || s < 0) throw new Error('El stock debe ser 0 o mayor')
    datos.stock = s
  }
  // Atributos específicos
  const attr = {}
  if (tipoProducto === 'alimento') {
    if (!document.getElementById('edad')?.value) throw new Error('Selecciona la edad para alimentos')
    if (!document.getElementById('peso')?.value) throw new Error('Selecciona el peso para alimentos')
    if (!document.getElementById('sabor')?.value) throw new Error('Selecciona el sabor para alimentos')
    attr.edad = document.getElementById('edad').value.trim()
    attr.peso = document.getElementById('peso').value.trim()
    attr.sabor = document.getElementById('sabor').value.trim()
  } else if (tipoProducto === 'juguete') {
    if (!document.getElementById('tamano')?.value) throw new Error('Selecciona el tamaño para juguetes')
    if (!document.getElementById('material')?.value) throw new Error('Selecciona el material para juguetes')
    attr.tamano = document.getElementById('tamano').value.trim()
    attr.material = document.getElementById('material').value.trim()
  }
  if (Object.keys(attr).length) datos.atributos_especificos = attr
  return datos
}

// Validar datos básicos del producto
function validarDatos (datos) {
  const errores = []
  if (!datos.nombre || datos.nombre.length < 3) errores.push('El nombre debe tener al menos 3 caracteres')
  if (!datos.marca || datos.marca.length < 2) errores.push('La marca debe tener al menos 2 caracteres')
  if (!datos.categoria) errores.push('Selecciona un tipo de producto')
  if (!datos.tipo_mascota) errores.push('Selecciona un tipo de mascota')
  if (datos.precio !== undefined && (isNaN(datos.precio) || datos.precio < 0.01)) errores.push('El precio debe ser mayor a 0.01')
  if (datos.stock !== undefined && (isNaN(datos.stock) || datos.stock < 0)) errores.push('El stock debe ser 0 o mayor')
  return errores
}

// Enviar actualización del producto
async function actualizarProducto (e) {
  e.preventDefault()
  limpiarErrores()
  const id = getIdFromURL()
  if (!id) { mostrarErrores('ID de producto no encontrado'); return }
  try {
    let datos = {}
    const errores = []
    try { datos = recopilarDatosFormulario() } catch (err) { errores.push(err.message) }
    if (Object.keys(datos).length) errores.push(...validarDatos(datos))
    if (errores.length) { mostrarErrores(errores); return }
    // Confirmar acción
    const ok = await confirmarModal('Modificar producto', '¿Estás seguro que desea modificar el producto?', 'Modificar', 'confirmar')
    if (!ok) return
    // Enviar al backend
    const r = await fetch(API_ROUTES.actualizarProducto(id), {
      method: 'PUT',
      headers: { ...tokenUtils.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    if (!r.ok) {
      const error = await r.json()
      mostrarErrores(error.error || `Error del servidor: ${r.status}`)
      return
    }
    alert(`¡Producto actualizado con éxito!\n\nEl producto "${datos.nombre}" ha sido actualizado correctamente.`)
    setTimeout(() => { window.location.href = '/front-end/html/admin/dashboard.html' }, 1000)
  } catch (e) {
    mostrarErrores(e.message || 'Error inesperado al actualizar el producto')
  }
  return false
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  // Proteger ruta: solo admin logueado
  const admin = await requireAuth()
  if (!admin) return
  // Cargar producto existente
  const id = getIdFromURL()
  if (!id) {
    mostrarErrores('ID de producto no encontrado')
    setTimeout(() => { window.location.href = '/front-end/html/admin/dashboard.html' }, 2000)
    return
  }
  await cargarProducto(id)
  // Configurar campos dinámicos según tipo
  configurarCamposDinamicosProducto('tipoProducto', { alimento: 'camposAlimento', juguete: 'camposJuguete' })
  // Listener de envío de formulario
  const form = document.getElementById('formModificarProducto')
  if (form) form.addEventListener('submit', actualizarProducto)
})
