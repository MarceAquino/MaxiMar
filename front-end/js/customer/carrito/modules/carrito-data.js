// modules/carrito-data.js - Gestión de datos y almacenamiento del carrito
import { API_ROUTES } from '../../../config/api.js'

let carrito = []
let productosDisponibles = []

// === GESTIÓN DE LOCALSTORAGE ===
export function cargarCarrito () {
  console.log('📦 Cargando carrito desde localStorage...')
  const carritoGuardado = localStorage.getItem('carrito')
  carrito = carritoGuardado ? JSON.parse(carritoGuardado) : []
  console.log(`✅ Carrito cargado: ${carrito.length} productos`)
  return carrito
}

export function guardarCarrito () {
  localStorage.setItem('carrito', JSON.stringify(carrito))
  console.log('💾 Carrito guardado en localStorage')
}

// === GESTIÓN DE PRODUCTOS ===
export async function cargarProductos () {
  try {
    const response = await fetch(API_ROUTES.productos)
    if (!response.ok) {
      throw new Error('Error al obtener productos')
    }
    productosDisponibles = await response.json()
    console.log(`✅ ${productosDisponibles.length} productos cargados para validación de stock`)
    return productosDisponibles
  } catch (error) {
    console.error('❌ Error cargando productos:', error)
    productosDisponibles = []
    return []
  }
}

export function obtenerProductoPorId (id) {
  return productosDisponibles.find(p => p.producto_id === id) || null
}

// === VALIDACIÓN DE STOCK ===
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

// === GETTERS ===
export function obtenerCarrito () {
  return [...carrito] // Retorna copia para evitar mutaciones
}

export function obtenerCarritoActual () {
  const carritoGuardado = localStorage.getItem('carrito')
  return carritoGuardado ? JSON.parse(carritoGuardado) : []
}

export function obtenerCantidadTotalCarrito () {
  const carritoActual = obtenerCarritoActual()
  return carritoActual.reduce((suma, item) => suma + item.cantidad, 0)
}

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
export function setCarrito (nuevoCarrito) {
  carrito = nuevoCarrito
}
