// productos.js - Archivo principal optimizado
import { API_ROUTES } from '../../config/api.js'
import { inicializarFiltros } from '../filtros-tabs.js'
import { cambiarImagen, establecerImagen } from './modules/imagen-manager.js'
import { mostrarFeedbackAgregar, mostrarMensaje } from './modules/notificaciones.js'
import { renderizarListaProductos } from './modules/producto-render.js'
import { validarProducto, validarStock } from './modules/validadores.js'

import { actualizarContadorCarrito, agregarAlCarrito } from '../carrito/carrito.js'

// Variables globales
let productos = []
const elementos = {
  divProductos: document.querySelector('.divProductos'),
  cartCountElement: document.getElementById('cart-icon-count')
}

// Función principal de carga de productos
async function cargarProductos () {
  try {
    const response = await fetch(API_ROUTES.productos)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    productos = Array.isArray(data) ? data : []
    localStorage.setItem('productos', JSON.stringify(productos))
  } catch (error) {
    console.error('Error al cargar productos desde API:', error)
    await cargarProductosDesdeCache()
  }

  // Filtrar productos activos
  productos = productos.filter(producto => producto.activo)
}

// Función auxiliar para cargar desde caché
async function cargarProductosDesdeCache () {
  const productosGuardados = localStorage.getItem('productos')
  if (productosGuardados) {
    productos = JSON.parse(productosGuardados)
    mostrarMensaje('Productos cargados desde caché local', 'warning')
  } else {
    console.warn('No hay productos disponibles')
    productos = []
  }
}

// Función principal de inicialización
function inicializarPaginaProductos () {
  renderizarProductos(productos)
  inicializarFiltros(productos, renderizarProductos)
  configurarEventos()
}

// Función de renderizado principal
function renderizarProductos (lista) {
  if (!elementos.divProductos) {
    console.warn('Contenedor de productos no encontrado')
    return
  }

  renderizarListaProductos(lista, elementos.divProductos)
}

// Configuración de eventos
function configurarEventos () {
  if (!elementos.divProductos) {
    console.warn('Contenedor de productos no encontrado para eventos')
    return
  }

  elementos.divProductos.addEventListener('click', manejarClickProductos)
}

// Manejador de clicks en productos
function manejarClickProductos (e) {
  const btnAgregar = e.target.closest('.agregarCarrito')
  if (btnAgregar && !btnAgregar.disabled) {
    manejarAgregarAlCarrito(btnAgregar)
  }
}

// Función para agregar al carrito
function manejarAgregarAlCarrito (boton) {
  const id = parseInt(boton.dataset.id)

  if (!validarProducto.validarId(id)) {
    console.error('ID de producto inválido')
    return
  }

  const producto = productos.find(p => p.producto_id === id)

  if (!producto) {
    mostrarMensaje('Producto no encontrado', 'danger')
    return
  }

  if (!validarStock(producto)) {
    mostrarMensaje('Este producto no tiene stock disponible', 'warning')
    return
  }

  const agregadoExitoso = agregarAlCarrito(producto)

  if (agregadoExitoso) {
    mostrarFeedbackAgregar()
    actualizarContadorCarrito()
  }
}

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await cargarProductos()

    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      console.log('Carrito encontrado en localStorage')
    }

    inicializarPaginaProductos()
    actualizarContadorCarrito()
  } catch (error) {
    mostrarMensaje('Error al cargar la aplicación', 'danger')
  }
})

// Funciones globales para compatibilidad (más simples)
window.changeImage = cambiarImagen
window.setImage = establecerImagen

// Exportaciones
export {
  cargarProductos,
  inicializarPaginaProductos,
  productos,
  renderizarProductos
}
