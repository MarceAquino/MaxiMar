import { API_URL } from '../config/api.js'

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎫 Iniciando página de ticket...')

  // Obtener ID de la venta desde localStorage
  const idVenta = localStorage.getItem('ultima_venta_id')

  // Verificar que tengamos un ID de venta
  if (!idVenta) {
    console.error('❌ No se encontró ID de venta en localStorage')
    mostrarError('No se pudo cargar la información de la compra')
    return
  }

  console.log(`📋 Cargando datos de venta ID: ${idVenta}`)

  try {
    // Cargar y mostrar los datos de la venta
    await cargarDatosVenta(idVenta)
    console.log('✅ Ticket cargado exitosamente')
  } catch (error) {
    console.error('❌ Error al cargar ticket:', error)
    mostrarError('Error al cargar los datos de la compra')
  }

  // Configurar los botones de la página
  configurarBotones()
})

// ======================================================================
// CARGAR DATOS DE LA VENTA
// ======================================================================
async function cargarDatosVenta (ventaId) {
  console.log('📋 Cargando datos de venta ID:', ventaId)
  try {
    const response = await fetch(`${API_URL}/sales/${ventaId}`)

    if (!response.ok) {
      throw new Error('Error al obtener datos de la venta')
    }

    const venta = await response.json()
    console.log('✅ Datos de venta cargados:', venta)

    // Mostrar datos en el ticket
    mostrarDatosCliente(venta)
    mostrarProductos(venta.productos)
    mostrarTotales(venta)
  } catch (error) {
    console.error('❌ Error al cargar venta:', error)
    throw error
  }
}

// ======================================================================
// MOSTRAR DATOS DEL CLIENTE
// ======================================================================
function mostrarDatosCliente (venta) {
  // Nombre del cliente
  const nombreElement = document.getElementById('usuario-nombre')
  if (nombreElement) {
    nombreElement.textContent = venta.cliente || 'Cliente Anónimo'
  }

  // Fecha y hora formateada
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

  // Número de orden
  const ordenElement = document.getElementById('orden-numero')
  if (ordenElement) {
    ordenElement.textContent = venta.numero_orden
  }
}

// ======================================================================
// MOSTRAR PRODUCTOS Escritorio
// ======================================================================
function mostrarProductos (productos) {
  const tbody = document.getElementById('productos-ticket')
  if (!tbody) return

  tbody.innerHTML = ''

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

// ======================================================================
// MOSTRAR TOTALES
// ======================================================================
function mostrarTotales (venta) {
  // Subtotal
  const subtotalElement = document.getElementById('subtotal')
  if (subtotalElement) {
    subtotalElement.textContent = formatearPrecio(venta.subtotal)
  }

  // Total
  const totalElement = document.getElementById('total')
  if (totalElement) {
    totalElement.textContent = formatearPrecio(venta.total)
  }
}

// ======================================================================
// CONFIGURAR BOTONES
// ======================================================================
function configurarBotones () {
  // Botón descargar PDF
  const btnDescargar = document.getElementById('btn-descargar-pdf')
  if (btnDescargar) {
    btnDescargar.addEventListener('click', descargarPDF)
  }
  // Botón finalizar (resetear todo y volver al inicio)
  const btnFinalizar = document.getElementById('btn-finalizar')
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      // Usar la misma lógica que salir.js para resetear todo
      localStorage.clear()
      window.location.href = '/front-end/index.html'
    })
  }
}

// ======================================================================
// DESCARGAR PDF
// ======================================================================
function descargarPDF () {
  // Usar la funcionalidad de imprimir del navegador
  // El usuario puede elegir "Guardar como PDF" en las opciones de impresión
  window.print()
}

// ======================================================================
// UTILIDADES
// ======================================================================
function formatearPrecio (precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(precio)
}

function mostrarError (mensaje) {
  // Usar alertas personalizadas si están disponibles
  if (window.customAlert) {
    window.customAlert.error(mensaje, {
      duration: 0, // No auto-cerrar
      action: '<button onclick="window.location.href=\'/front-end/index.html\'">Volver al Inicio</button>'
    })
    return
  }

  // Fallback a mostrar error en la página
  const container = document.querySelector('.container')
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger text-center">
        <h4><i class="fas fa-exclamation-triangle me-2"></i>Error</h4>
        <p>${mensaje}</p>
        <a href="/front-end/index.html" class="btn btn-warning">
          <i class="fas fa-home me-2"></i>Volver al Inicio
        </a>
      </div>
    `
  }
}
