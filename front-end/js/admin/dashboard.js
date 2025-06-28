// ======================================================================
// DASHBOARD PRINCIPAL - COORDINADOR MODULAR
// ======================================================================
// Este archivo principal coordina todos los módulos del dashboard
// Arquitectura modular para mejor mantenimiento y organización

import { tokenUtils } from '../../config/api.js'
import { requireAuth } from '../auth-guard.js'
import { DashboardState } from './modules/dashboard-state.js'
import { configurarEventListeners, configurarInterfazSegunRol } from './modules/interface-manager.js'
import { cargarProductos } from './modules/products-manager.js'

// ======================================================================
// INICIALIZACIÓN PRINCIPAL DEL DASHBOARD
// ======================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando dashboard modular...')

  try {
    // 1. Verificar que el usuario esté autenticado
    await requireAuth()
    console.log('✅ Autenticación verificada')

    // 2. Obtener datos del usuario desde el token
    const usuarioActual = tokenUtils.getDecodedToken()
    DashboardState.setUsuarioActual(usuarioActual)
    console.log('✅ Usuario cargado:', usuarioActual?.nombre)

    // 3. Configurar la interfaz según el rol (admin vs superadmin)
    configurarInterfazSegunRol()
    console.log('✅ Interfaz configurada según rol')

    // 4. Cargar productos desde el servidor
    await cargarProductos()
    console.log('✅ Productos cargados')

    // 5. Configurar botones y eventos
    configurarEventListeners()
    console.log('✅ Event listeners configurados')

    console.log('🎉 Dashboard inicializado correctamente')
  } catch (error) {
    console.error('❌ Error inicializando dashboard:', error)

    // Mostrar error en la interfaz si es posible
    const contenedor = document.getElementById('contenedorProductos') || document.body
    contenedor.innerHTML = `
      <div class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Error al cargar el dashboard: ${error.message}
        <br>
        <button class="btn btn-outline-danger btn-sm mt-2" onclick="location.reload()">
          <i class="fas fa-redo me-1"></i>
          Recargar página
        </button>
      </div>
    `
  }
})

// ======================================================================
// INFORMACIÓN DEL MÓDULO
// ======================================================================
console.log(`
🏗️ Dashboard Modular v2.0
📁 Estructura:
  - dashboard.js (coordinador principal)
  - modules/dashboard-state.js (estado global)
  - modules/products-manager.js (gestión de productos)
  - modules/admins-manager.js (gestión de administradores)
  - modules/sales-manager.js (gestión de ventas)
  - modules/interface-manager.js (interfaz y navegación)
`)
