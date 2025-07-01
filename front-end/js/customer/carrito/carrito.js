// carrito.js - Archivo principal del carrito
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

// === INICIALIZACIÓN DE LA PÁGINA DEL CARRITO ===
export async function inicializarPaginaCarrito () {
  console.log('🚀 Inicializando página del carrito...')

  try {
    // Cargar productos para validación de stock
    await cargarProductos()

    // Renderizar carrito
    renderCarrito()

    // Configurar eventos
    configurarEventosCarrito()
    configurarEventosEspeciales()

    console.log('✅ Página del carrito inicializada correctamente')
  } catch (error) {
    console.error('❌ Error inicializando página del carrito:', error)
    mostrarMensaje('Error al cargar la página del carrito', 'danger')
  }
}

// === CONFIGURACIÓN DE EVENTOS ESPECIALES ===
function configurarEventosEspeciales () {
  // Botón vaciar carrito
  const vaciarBtn = document.getElementById('vaciar-carrito')
  if (vaciarBtn) {
    vaciarBtn.addEventListener('click', manejarVaciarCarrito)
  }

  // Botón finalizar compra
  const finalizarBtn = document.getElementById('btn-finalizar-compra')
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', finalizarCompra)
  }
}

function manejarVaciarCarrito () {
  const carrito = JSON.parse(localStorage.getItem('carrito') || '[]')

  if (carrito.length === 0) {
    mostrarMensaje('El carrito ya está vacío', 'info')
    return
  }

  const confirmar = confirm('¿Estás seguro de que quieres vaciar todo el carrito? Esta acción no se puede deshacer.')

  if (confirmar) {
    vaciarCarrito()
    mostrarMensaje('Carrito vaciado correctamente', 'success')
  }
}

// === INICIALIZACIÓN GENERAL ===
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌟 Iniciando aplicación del carrito...')

  try {
    // Cargar carrito desde localStorage
    cargarCarrito()

    // Cargar productos para validación de stock
    await cargarProductos()

    // Actualizar contador del carrito
    actualizarContadorCarrito()

    // Si estamos en la página del carrito, inicializar completamente
    if (obtenerPaginaActual() === 'carrito') {
      await inicializarPaginaCarrito()
    }

    // Exportar funciones globales para compatibilidad
    exportarFuncionesGlobales()

    console.log('🎉 Aplicación del carrito iniciada correctamente')
  } catch (error) {
    console.error('💥 Error crítico al inicializar carrito:', error)
  }
})

// === EXPORTACIÓN PARA COMPATIBILIDAD ===
function exportarFuncionesGlobales () {
  // Exportar funciones al objeto window para compatibilidad con HTML onclick
  window.agregarAlCarrito = agregarAlCarrito
  window.eliminarItemCarrito = eliminarItemCarrito
  window.cambiarCantidadCarrito = cambiarCantidadCarrito
  window.vaciarCarrito = vaciarCarrito
  window.finalizarCompra = finalizarCompra
  window.actualizarContadorCarrito = actualizarContadorCarrito
}

// === EXPORTACIONES DEL MÓDULO ===
export {

    // Funciones de UI
    actualizarContadorCarrito,
    // Funciones principales
    agregarAlCarrito, cambiarCantidadCarrito, eliminarItemCarrito, finalizarCompra,
    // Función de inicialización
    renderCarrito, vaciarCarrito
}
