/*
 * Módulo de finalización de compras del carrito
 *
 * FUNCIONALIDADES:
 * - Validación del carrito antes de la compra.
 * - Confirmación de la compra con el usuario mediante modal.
 * - Preparación y envío de datos de la venta al servidor.
 * - Limpieza del carrito tras una compra exitosa.
 * - Redirección a la página de ticket de compra.
 *
 * DEPENDENCIAS:
 * - confirmarModal para mostrar modales de confirmación.
 * - Funciones para manejo de datos del carrito: guardarCarrito, obtenerCarrito, setCarrito.
 * - Función mostrarMensaje para notificaciones visuales.
 * - Constantes API_ROUTES para rutas del backend.
 */

import { API_ROUTES } from '../../../config/api.js'
import { guardarCarrito, obtenerCarrito, setCarrito } from './carrito-data.js'
import { mostrarMensaje } from './carrito-utils.js'
import { confirmarModal } from '../../../utils/modales.js'

/**
 * Función principal que maneja todo el proceso de checkout
 * Valida el carrito, confirma con el usuario y procesa la venta
 */
export async function finalizarCompra () {
  const carrito = obtenerCarrito()

  // Validar que el carrito no esté vacío
  if (carrito.length === 0) {
    mostrarMensaje('Tu carrito está vacío', 'warning')
    return
  }

  // Obtener datos del cliente desde localStorage
  const nombreUsuario = localStorage.getItem('nombreUsuario')
  const cliente = nombreUsuario || 'Cliente Anónimo'

  // Mostrar confirmación al usuario
  const confirmacion = await confirmarCompra(carrito, cliente)
  if (!confirmacion) {
    return
  }

  try {
    mostrarMensaje('Procesando compra...', 'info')

    // Preparar datos para enviar al servidor
    const ventaData = prepararDatosVenta(carrito, cliente)
    const resultado = await enviarVenta(ventaData)

    if (resultado.success) {
      // Guardar ID de venta para mostrar en el ticket
      localStorage.setItem('ultima_venta_id', resultado.venta_id)

      // Limpiar carrito tras compra exitosa
      limpiarCarritoCompra()

      // Redirigir a la página del ticket
      window.location.href = '/front-end/html/customer/ticket.html'
    } else {
      mostrarMensaje(`Error: ${resultado.message}`, 'danger')
    }
  } catch (error) {
    // Manejo de errores de conexión o servidor
    mostrarMensaje('Error de conexión. Intenta nuevamente.', 'danger')
  }
}

// === FUNCIONES AUXILIARES ===

/**
 * Muestra un diálogo de confirmación con resumen de la compra
 * @param {Array} carrito - Items del carrito a comprar
 * @param {string} cliente - Nombre del cliente
 * @returns {boolean} true si el usuario confirma, false si cancela
 */
async function confirmarCompra (carrito, cliente) {
  // Calcular totales para mostrar en confirmación
  const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0)
  const totalCompra = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0)

  const confirmMessage = `¿Estás seguro de realizar esta compra?

Resumen:
• ${cantidadItems} producto${cantidadItems !== 1 ? 's' : ''}
• Total: $${totalCompra.toLocaleString('es-AR')}
• Cliente: ${cliente}

Esta acción no se puede deshacer.`

  // Creacion de modal para confirmar crear producto.
  const confirmar = await confirmarModal('Confirmar Compra', confirmMessage, 'Comprar', 'confirmar')
  return confirmar
}

/**
 * Prepara los datos de la venta en el formato esperado por el servidor
 * @param {Array} carrito - Items del carrito
 * @param {string} cliente - Nombre del cliente
 * @returns {Object} Datos formateados para enviar al API
 */
function prepararDatosVenta (carrito, cliente) {
  return {
    cliente,
    items: carrito.map(item => ({
      producto_id: item.producto_id || item.id,
      cantidad: item.cantidad
    }))
  }
}

/**
 * Envía los datos de venta al servidor
 * @param {Object} ventaData - Datos de la venta a enviar
 * @returns {Object} Resultado con éxito, ID de venta y mensaje
 */
async function enviarVenta (ventaData) {
  const response = await fetch(API_ROUTES.ventas.crear, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ventaData)
  })

  const data = await response.json()

  return {
    success: response.ok,
    venta_id: data.venta_id,
    message: data.message
  }
}

/**
 * Limpia completamente el carrito después de una compra exitosa
 * También actualiza el contador visual si está disponible
 */
function limpiarCarritoCompra () {
  setCarrito([])
  guardarCarrito()

  // Actualizar contador visual si la función está disponible
  if (window.actualizarContadorCarrito) {
    window.actualizarContadorCarrito()
  }
}
