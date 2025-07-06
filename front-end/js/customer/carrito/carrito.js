/**
 * CARRITO DE COMPRAS - Archivo principal
 *
 * Gestiona la inicialización y coordinación de todos los módulos del carrito.
 * Maneja eventos principales y exporta funciones para compatibilidad global.
 */

import { confirmarModal } from '../../utils/modales.js'
import { mostrarMensajeBienvenida } from '../utils/mensajeBienvenida.js'
import {
  agregarAlCarrito,
  cambiarCantidadCarrito,
  eliminarItemCarrito,
  vaciarCarrito
} from './modules/carrito-actions.js'
import { finalizarCompra } from './modules/carrito-checkout.js'
import { cargarCarrito, cargarProductos } from './modules/carrito-data.js'
import {
  actualizarContadorCarrito,
  configurarEventosCarrito,
  renderCarrito
} from './modules/carrito-ui.js'
import { mostrarMensaje, obtenerPaginaActual } from './modules/carrito-utils.js'

/**
 * Inicializa la página del carrito
 */
export async function inicializarPaginaCarrito () {
  try {
    await cargarProductos()
    renderCarrito()
    configurarEventosCarrito()
    configurarEventosEspeciales()
  } catch (error) {
    mostrarMensaje('Error al cargar la página del carrito', 'danger')
  }
}

/**
 * Configura eventos especiales del carrito
 */
function configurarEventosEspeciales () {
  const vaciarBtn = document.getElementById('vaciar-carrito')
  if (vaciarBtn) {
    vaciarBtn.addEventListener('click', manejarVaciarCarrito)
  }

  const finalizarBtn = document.getElementById('btn-finalizar-compra')
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', finalizarCompra)
  }
}

/**
 * Maneja el vaciado del carrito con un modal de confirmacion.
 */
async function manejarVaciarCarrito () {
  const carrito = JSON.parse(localStorage.getItem('carrito') || '[]')

  if (carrito.length === 0) {
    mostrarMensaje('El carrito ya está vacío', 'info')
    return
  }

  // Creacion de modal para confirmar vaciado de carrito.
  const confirmar = await confirmarModal('Vaciar carrito', '¿Estás seguro de que quieres vaciar todo el carrito?', 'Vaciar', 'peligro')
  if (confirmar) {
    vaciarCarrito()
    mostrarMensaje('Carrito vaciado correctamente', 'success')
  }
}

/**
 * Inicialización principal de la aplicación
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    cargarCarrito()
    await cargarProductos()
    actualizarContadorCarrito()

    if (obtenerPaginaActual() === 'carrito') {
      await inicializarPaginaCarrito()
    }

    mostrarMensajeBienvenida()
  } catch (error) {
    mostrarMensaje('Error al inicializar la aplicación', 'danger')
  }
})

// Exportaciones del módulo
export {
  actualizarContadorCarrito, agregarAlCarrito,
  cambiarCantidadCarrito,
  eliminarItemCarrito, finalizarCompra, renderCarrito, vaciarCarrito
}
