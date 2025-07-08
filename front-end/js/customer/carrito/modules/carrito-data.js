/**
 * Módulo de gestión de datos y almacenamiento del carrito
 *
 * FUNCIONALIDADES:
 * - Persistencia del carrito en localStorage.
 * - Carga y almacenamiento de productos disponibles desde el servidor.
 * - Validación de stock de productos antes de agregar al carrito.
 * - Operaciones CRUD básicas sobre el carrito en localStorage.
 *
 * DEPENDENCIAS:
 * - Constantes API_ROUTES para rutas de backend.
 */

import { API_ROUTES } from '../../../config/api.js'

// Variables globales para almacenar datos en memoria
let carrito = []
let productosDisponibles = []

// === GESTIÓN DE LOCALSTORAGE ===

/**
 * Carga el carrito desde localStorage
 * @returns {Array} Array con los items del carrito
 */
export function cargarCarrito () {
  const carritoGuardado = localStorage.getItem('carrito')
  carrito = carritoGuardado ? JSON.parse(carritoGuardado) : []
  return carrito
}

/**
 * Guarda el carrito actual en localStorage
 */
export function guardarCarrito () {
  localStorage.setItem('carrito', JSON.stringify(carrito))
}

// === GESTIÓN DE PRODUCTOS ===

/**
 * Carga la lista de productos disponibles desde el servidor
 * @returns {Array} Array con todos los productos disponibles
 */
export async function cargarProductos () {
  try {
    const response = await fetch(API_ROUTES.productos)
    if (!response.ok) {
      throw new Error('Error al obtener productos')
    }
    productosDisponibles = await response.json()
    return productosDisponibles
  } catch (error) {
    // En caso de error, devolver array vacío
    productosDisponibles = []
    return []
  }
}

/**
 * Busca un producto específico por su ID
 * @param {number} id - ID del producto a buscar
 * @returns {Object|null} Producto encontrado o null si no existe
 */
export function obtenerProductoPorId (id) {
  return productosDisponibles.find(p => p.producto_id === id) || null
}

// === VALIDACIÓN DE STOCK ===

/**
 * Verifica si hay suficiente stock de un producto
 * @param {number} productoId - ID del producto a verificar
 * @param {number} cantidadDeseada - Cantidad que se quiere agregar
 * @returns {Object} {disponible: boolean, mensaje: string}
 */
export function verificarStock (productoId, cantidadDeseada) {
  const producto = obtenerProductoPorId(productoId)

  if (!producto) {
    return {
      disponible: false,
      stockActual: 0,
      mensaje: 'Producto no encontrado'
    }
  }

  if (!producto.activo) {
    return {
      disponible: false,
      stockActual: 0,
      mensaje: 'Producto no disponible'
    }
  }

  const itemEnCarrito = carrito.find(item => (item.producto_id || item.id) === productoId)
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0
  const cantidadTotal = cantidadEnCarrito + cantidadDeseada

  if (cantidadTotal > producto.stock) {
    return {
      disponible: false,
      stockActual: producto.stock,
      cantidadEnCarrito,
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, en carrito: ${cantidadEnCarrito}`
    }
  }

  return {
    disponible: true,
    stockActual: producto.stock,
    cantidadEnCarrito,
    mensaje: 'Stock disponible'
  }
}

// === OPERACIONES DE CARRITO ===

/**
 * Obtiene una copia del carrito actual
 * @returns {Array} Copia del array del carrito
 */
export function obtenerCarrito () {
  return [...carrito] // Retorna copia para evitar mutaciones
}

/**
 * Obtiene el carrito directamente desde localStorage
 * @returns {Array} Items del carrito guardados
 */
export function obtenerCarritoActual () {
  const carritoGuardado = localStorage.getItem('carrito')
  return carritoGuardado ? JSON.parse(carritoGuardado) : []
}

/**
 * Calcula la cantidad total de items en el carrito
 * @returns {number} Número total de productos en el carrito
 */
export function obtenerCantidadTotalCarrito () {
  const carritoActual = obtenerCarritoActual()
  return carritoActual.reduce((suma, item) => suma + item.cantidad, 0)
}

/**
 * Calcula los totales del carrito (subtotal, total, cantidad de items)
 * @returns {Object} {subtotal, total, items}
 */
export function calcularTotales () {
  let subtotal = 0
  let totalItemsCount = 0

  carrito.forEach(item => {
    subtotal += item.precio * item.cantidad
    totalItemsCount += item.cantidad
  })

  return {
    subtotal,
    total: subtotal,
    items: totalItemsCount
  }
}

// === SETTER INTERNO ===

/**
 * Actualiza el carrito en memoria (uso interno)
 * @param {Array} nuevoCarrito - Nuevo array del carrito
 */
export function setCarrito (nuevoCarrito) {
  carrito = nuevoCarrito
}
