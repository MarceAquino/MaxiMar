// Proceso de finalización de compra
import { API_ROUTES } from '../../../config/api.js'
import { guardarCarrito, obtenerCarrito, setCarrito } from './carrito-data.js'
import { mostrarMensaje } from './carrito-utils.js'

// === FINALIZAR COMPRA ===
export async function finalizarCompra () {
  const carrito = obtenerCarrito()

  if (carrito.length === 0) {
    mostrarMensaje('Tu carrito está vacío', 'warning')
    return
  }

  // Obtener datos del cliente
  const nombreUsuario = localStorage.getItem('nombreUsuario')
  const cliente = nombreUsuario || 'Cliente Anónimo'

  // Mostrar confirmación
  if (!confirmarCompra(carrito, cliente)) {
    return // Usuario canceló la compra
  }

  try {
    mostrarMensaje('Procesando compra...', 'info')

    const ventaData = prepararDatosVenta(carrito, cliente)
    const resultado = await enviarVenta(ventaData)

    if (resultado.success) {
      // Guardar ID de venta para el ticket
      localStorage.setItem('ultima_venta_id', resultado.venta_id)

      // Limpiar carrito
      limpiarCarritoCompra()

      // Redirigir a ticket
      window.location.href = '/front-end/html/customer/ticket.html'
    } else {
      mostrarMensaje(`Error: ${resultado.message}`, 'danger')
    }
  } catch (error) {
    console.error('Error al procesar compra:', error)
    mostrarMensaje('Error de conexión. Intenta nuevamente.', 'danger')
  }
}

// === HELPERS DE COMPRA ===
function confirmarCompra (carrito, cliente) {
  const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0)
  const totalCompra = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0)

  const confirmMessage = `¿Estás seguro de realizar esta compra?

Resumen:
• ${cantidadItems} producto${cantidadItems !== 1 ? 's' : ''}
• Total: $${totalCompra.toLocaleString('es-AR')}
• Cliente: ${cliente}

Esta acción no se puede deshacer.`

  return confirm(confirmMessage)
}

function prepararDatosVenta (carrito, cliente) {
  return {
    cliente,
    items: carrito.map(item => ({
      producto_id: item.producto_id || item.id,
      cantidad: item.cantidad
    }))
  }
}

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

function limpiarCarritoCompra () {
  setCarrito([])
  guardarCarrito()

  // Actualizar contador si está disponible
  if (window.actualizarContadorCarrito) {
    window.actualizarContadorCarrito()
  }
}
