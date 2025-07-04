/**
 * MÓDULO: Ticket de Compra
 *
 * Este archivo maneja la página de confirmación de compra (ticket).
 *
 * FUNCIONALIDADES:
 * - Recupera el ID de la venta desde localStorage
 * - Carga los datos completos de la venta desde el backend
 * - Muestra información del cliente, productos y totales
 * - Permite imprimir/descargar el ticket como PDF
 * - Proporciona opción para finalizar y regresar al inicio
 *
 * FLUJO:
 * 1. Se obtiene el ID de venta guardado tras completar una compra
 * 2. Se consulta al backend para obtener todos los detalles
 * 3. Se renderiza la información en formato de ticket
 * 4. El usuario puede imprimir o finalizar la sesión
 *
 * ALMACENAMIENTO:
 * - Solo lee 'ultima_venta_id' del localStorage
 * - Al finalizar, limpia todo el localStorage
 */

import { API_ROUTES } from '../config/api.js'

/**
 * Muestra mensaje de bienvenida si hay usuario logueado
 */
function mostrarMensajeBienvenida () {
  const mensajeBienvenida = document.getElementById('welcomeMessage')
  const usuarioGuardado = localStorage.getItem('nombreUsuario')

  if (mensajeBienvenida && usuarioGuardado) {
    mensajeBienvenida.textContent = `¡Hola, ${usuarioGuardado}!`
  }
}

/**
 * Inicializa la página del ticket de compra
 * Carga los datos de la venta desde el backend y configura la interfaz
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Mostrar mensaje de bienvenida
  mostrarMensajeBienvenida()

  // Obtener ID de la venta desde localStorage
  const idVenta = localStorage.getItem('ultima_venta_id')

  // Verificar que tengamos un ID de venta
  if (!idVenta) {
    alert('No se pudo cargar la información de la compra')
    return
  }

  try {
    // Cargar y mostrar los datos de la venta
    await cargarDatosVenta(idVenta)
  } catch (error) {
    alert('Error al cargar los datos de la compra')
  }

  // Configurar los botones de la página
  configurarBotones()
})

/**
 * Carga los datos de una venta específica desde el backend
 * @param {string} ventaId - ID de la venta a cargar
 */
async function cargarDatosVenta (ventaId) {
  // Hacer petición al backend para obtener los datos de la venta
  const response = await fetch(API_ROUTES.ventas.obtener(ventaId))

  if (!response.ok) {
    throw new Error('Error al obtener datos de la venta')
  }

  const venta = await response.json()

  // Mostrar datos en el ticket
  mostrarDatosCliente(venta)
  mostrarProductos(venta.productos)
  mostrarTotales(venta)
}

/**
 * Muestra los datos del cliente en el ticket
 * @param {Object} venta - Objeto con los datos de la venta
 */
function mostrarDatosCliente (venta) {
  // Mostrar nombre del cliente
  const nombreElement = document.getElementById('usuario-nombre')
  if (nombreElement) {
    nombreElement.textContent = venta.cliente || 'Cliente Anónimo'
  }

  // Mostrar fecha y hora formateada
  const fechaElement = document.getElementById('fecha-compra')
  if (fechaElement) {
    const fecha = new Date(venta.fecha)
    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    fechaElement.textContent = fechaFormateada
  }

  // Mostrar número de orden único
  const ordenElement = document.getElementById('orden-numero')
  if (ordenElement) {
    ordenElement.textContent = venta.numero_orden
  }
}

/**
 * Muestra la lista de productos comprados en la tabla del ticket
 * @param {Array} productos - Array de productos con sus detalles
 */
function mostrarProductos (productos) {
  const tbody = document.getElementById('productos-ticket')
  if (!tbody) return

  // Limpiar contenido anterior
  tbody.innerHTML = ''

  // Crear una fila por cada producto
  productos.forEach(producto => {
    const fila = document.createElement('tr')
    fila.innerHTML = `
      <td><strong>${producto.nombre}</strong></td>
      <td><strong>${producto.marca}</strong></td>
      <td class="text-center">${producto.cantidad}</td>
      <td class="text-end">${formatearPrecio(producto.precio_unitario)}</td>
      <td class="text-end">${formatearPrecio(producto.subtotal)}</td>
    `
    tbody.appendChild(fila)
  })
}

/**
 * Muestra el total de la venta
 * @param {Object} venta - Objeto con los datos de la venta
 */
function mostrarTotales (venta) {
  const totalElement = document.getElementById('total')
  if (totalElement) {
    totalElement.textContent = formatearPrecio(venta.total)
  }
}

/**
 * Configura los event listeners de los botones del ticket
 */
function configurarBotones () {
  // Botón para descargar/imprimir PDF del ticket
  const btnDescargar = document.getElementById('btn-descargar-pdf')
  if (btnDescargar) {
    btnDescargar.addEventListener('click', descargarPDF)
  }

  // Botón finalizar compra (limpiar datos y volver al inicio)
  const btnFinalizar = document.getElementById('btn-finalizar')
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      alert('Gracias por su compra. ¡Vuelva pronto!')
      // Limpiar localStorage y redirigir al inicio
      localStorage.clear()
      window.location.href = '/front-end/index.html'
    })
  }
}

/**
 * Abre el diálogo de impresión del navegador para generar PDF
 */
function descargarPDF () {
  window.print()
}

/**
 * Formatea un precio como moneda argentina
 * @param {number} precio - El precio a formatear
 * @returns {string} - Precio formateado con símbolo $ y separadores de miles
 */
function formatearPrecio (precio) {
  return '$' + Number(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
