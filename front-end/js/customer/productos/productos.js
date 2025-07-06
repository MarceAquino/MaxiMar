/**
 * MÓDULO: Gestión de Productos
 *
 * Archivo principal para la página de productos del cliente.
 *
 * FUNCIONALIDADES:
 * - Carga productos desde la API
 * - Renderiza lista de productos
 * - Maneja filtros por mascota y categoría
 * - Gestiona eventos de agregar al carrito
 * - Actualiza contador del carrito
 * - Muestra mensajes de bienvenida
 *
 * DEPENDENCIAS:
 * - API para cargar productos
 * - Sistema de filtros
 * - Módulos de renderizado y validación
 * - Sistema de carrito
 */

import { API_ROUTES } from '../../config/api.js'
import { actualizarContadorCarrito, agregarAlCarrito } from '../carrito/carrito.js'
import { inicializarFiltros } from './modules/filtros-tabs.js'
import { cambiarImagen, establecerImagen } from './modules/imagen-manager.js'
import { mostrarFeedbackAgregar, mostrarMensaje } from './modules/notificaciones.js'
import { renderizarListaProductos } from './modules/producto-render.js'
import { validarProducto, validarStock } from './modules/validadores.js'
import { mostrarMensajeBienvenida } from '../utils/mensajeBienvenida.js'

// Variables globales
let productos = []
const elementos = {
  divProductos: document.querySelector('.divProductos'),
  cartCountElement: document.getElementById('cart-icon-count')
}

/**
 * Carga productos desde la API del backend
 * Filtra solo productos activos para mostrar al cliente
 */
async function cargarProductos () {
  try {
    const response = await fetch(API_ROUTES.productos)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    productos = Array.isArray(data) ? data : []

    // Filtrar solo productos activos
    productos = productos.filter(producto => producto.activo)
  } catch (error) {
    mostrarMensaje('Error al cargar productos. Por favor, recarga la página.', 'danger')
    productos = []
  }
}

/**
 * Inicializa la página de productos con filtros y eventos
 */
function inicializarPaginaProductos () {
  renderizarProductos(productos)
  inicializarFiltros(productos, renderizarProductos)
  configurarEventos()
}

/**
 * Renderiza la lista de productos en el contenedor
 * @param {Array} lista - Array de productos a mostrar
 */
function renderizarProductos (lista) {
  if (!elementos.divProductos) {
    return
  }

  renderizarListaProductos(lista, elementos.divProductos)
}

/**
 * Configura los event listeners de la página
 */
function configurarEventos () {
  if (!elementos.divProductos) {
    return
  }

  elementos.divProductos.addEventListener('click', manejarClickProductos)
}

/**
 * Maneja los clicks en botones de productos
 * @param {Event} e - Evento de click
 */
function manejarClickProductos (e) {
  const btnAgregar = e.target.closest('.agregarCarrito')
  if (btnAgregar && !btnAgregar.disabled) {
    manejarAgregarAlCarrito(btnAgregar)
  }
}

/**
 * Agrega un producto al carrito con validaciones
 * @param {HTMLElement} boton - Botón que fue clickeado
 */
function manejarAgregarAlCarrito (boton) {
  const id = parseInt(boton.dataset.id)

  if (!validarProducto.validarId(id)) {
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

    // Verificar si hay carrito guardado y actualizar contador
    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      // Carrito encontrado, el contador se actualizará automáticamente
    }

    inicializarPaginaProductos()
    actualizarContadorCarrito()
    mostrarMensajeBienvenida()
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
  mostrarMensajeBienvenida,
  productos,
  renderizarProductos
}
