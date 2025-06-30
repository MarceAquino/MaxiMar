import { API_ROUTES } from '../../config/api.js'

let productosDisponibles = []

export async function cargarProductos () {
  try {
    const response = await fetch(API_ROUTES.productos)
    if (!response.ok) throw new Error('Error al obtener productos')
    productosDisponibles = await response.json()
  } catch (error) {
    console.error('Error cargando productos:', error)
    productosDisponibles = []
  }
}

export async function finalizarCompra () {
  // Implementación existente...
}

export { productosDisponibles }
