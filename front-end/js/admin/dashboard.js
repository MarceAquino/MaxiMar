/**
 * Dashboard principal del sistema de administración
 * Inicializa y coordina todos los módulos del dashboard
 */

import { requireAuth } from '../admin/auth-guard.js'
import { tokenUtils } from '../config/api.js'
import { DashboardState } from './modules/dashboard-state.js'
import { configurarEventListeners, configurarInterfazSegunRol } from './modules/interface-manager.js'
import { cargarProductos } from './modules/products-manager.js'

/**
 * Muestra error de inicialización en la interfaz
 */
function mostrarErrorInicializacion (error) {
  const contenedor = document.getElementById('contenedorProductos') || document.body
  const botonRecargar = document.createElement('button')
  botonRecargar.className = 'btn btn-outline-danger btn-sm mt-2'
  botonRecargar.innerHTML = '<i class="fas fa-redo me-1"></i> Recargar página'
  botonRecargar.addEventListener('click', () => location.reload())

  contenedor.innerHTML = `
    <div class="alert alert-danger text-center">
      <i class="fas fa-exclamation-triangle me-2"></i>
      Error al cargar el dashboard: ${error.message}
    </div>
  `
  contenedor.querySelector('.alert').appendChild(botonRecargar)
}

/**
 * Inicialización del dashboard
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await requireAuth()

    const usuarioActual = tokenUtils.getDecodedToken()
    DashboardState.setUsuarioActual(usuarioActual)

    configurarInterfazSegunRol()
    await cargarProductos()
    configurarEventListeners()
  } catch (error) {
    mostrarErrorInicializacion(error)
  }
})
