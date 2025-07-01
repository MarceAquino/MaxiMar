/**
 * Módulo para gestionar administradores en el dashboard
 * Contiene funciones para cargar, mostrar y cambiar estado de administradores
 */

import { API_ROUTES, tokenUtils } from '../../config/api.js'
import { DashboardState } from './dashboard-state.js'

/**
 * Carga la lista de administradores desde el servidor
 * Filtra los superadmins para no mostrarlos en la interfaz
 */
export async function cargarAdministradores () {
  try {
    // Hacer petición al servidor para obtener administradores
    const response = await fetch(API_ROUTES.admin.list, {
      headers: tokenUtils.getAuthHeaders()
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error('Error al obtener administradores')
    }

    // Convertir respuesta a JSON
    const data = await response.json()
    const todosLosAdmins = data.admins || data || []

    // Filtrar superadmins (no se muestran en la lista)
    const administradores = todosLosAdmins.filter(admin => admin.rol !== 'superadmin')

    // Guardar en el estado global
    DashboardState.setAdministradores(administradores)

    // Actualizar contador en la interfaz
    const contador = document.getElementById('contadorAdministradores')
    if (contador) {
      contador.textContent = `${administradores.length} administradores`
    }
  } catch (error) {
    // En caso de error, limpiar datos y mostrar mensaje
    DashboardState.setAdministradores([])

    const contenedor = document.getElementById('contenedorAdministradores')
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            Error al cargar administradores
          </div>
        </div>
      `
    }
  }
}

/**
 * Renderiza la lista de administradores en el HTML
 * Crea las tarjetas con información de cada administrador
 */
export function renderizarAdministradores () {
  // Buscar el contenedor donde mostrar los administradores
  const contenedor = document.getElementById('contenedorAdministradores')

  if (!contenedor) {
    return
  }

  // Limpiar contenido anterior
  contenedor.innerHTML = ''

  // Obtener lista de administradores del estado global
  const administradores = DashboardState.getAdministradores()

  // Si no hay administradores, mostrar mensaje
  if (administradores.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No hay administradores registrados</h5>
      </div>
    `
    return
  }

  // Configurar diseño en cuadrícula
  contenedor.className = 'row g-4'

  // Crear una tarjeta para cada administrador
  administradores.forEach(admin => {
    // Crear elemento div para cada administrador
    const div = document.createElement('div')
    div.className = 'col-lg-2-4 col-md-4 col-12'

    // Determinar el estado y estilos del administrador
    const estaActivo = admin.activo
    const estadoTexto = estaActivo ? 'Activo' : 'Inactivo'
    const botonTexto = estaActivo ? 'Desactivar' : 'Activar'
    const colorBoton = estaActivo ? 'btn-warning' : 'btn-success'
    const iconoBoton = estaActivo ? 'fa-ban' : 'fa-check'

    // Crear HTML de la tarjeta del administrador
    div.innerHTML = `
      <div class="admin-card">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h5 class="mb-0">${admin.nombre}</h5>
          <span class="admin-status ${estaActivo ? 'activo' : 'inactivo'}">${estadoTexto}</span>
        </div>
        <p class="text-muted mb-2">
          <i class="fas fa-envelope me-2"></i>${admin.email}
        </p>
        <p class="text-muted mb-3">
          <i class="fas fa-user-tag me-2"></i>Rol: ${admin.rol}
        </p>
        <div class="d-flex gap-2">
          <button class="btn ${colorBoton} btn-sm toggle-admin-btn"
                  data-admin-id="${admin.admin_id}"
                  data-admin-activo="${estaActivo}">
            <i class="fas ${iconoBoton} me-1"></i>${botonTexto}
          </button>
        </div>
      </div>
    `

    // Agregar la tarjeta al contenedor
    contenedor.appendChild(div)
  })

  // Configurar eventos de los botones después de crearlos
  agregarEventosABotones()
}

/**
 * Agrega event listeners a todos los botones de cambiar estado
 * Usa delegación de eventos moderna en lugar de onclick en HTML
 */
function agregarEventosABotones () {
  // Buscar todos los botones con la clase específica
  const botones = document.querySelectorAll('.toggle-admin-btn')

  // Agregar evento click a cada botón
  botones.forEach(boton => {
    boton.addEventListener('click', function () {
      // Obtener datos del administrador desde los atributos data-*
      const adminId = this.getAttribute('data-admin-id')
      const estaActivo = this.getAttribute('data-admin-activo') === 'true'

      // Llamar función para cambiar estado
      toggleAdminStatus(adminId, estaActivo)
    })
  })
}

/**
 * Cambia el estado (activo/inactivo) de un administrador
 * @param {string} adminId - ID del administrador
 * @param {boolean} estadoActual - Estado actual del administrador
 */
export async function toggleAdminStatus (adminId, estadoActual) {
  // Determinar la acción a realizar
  const accion = estadoActual ? 'desactivar' : 'activar'

  // Pedir confirmación al usuario
  if (!confirm(`¿Está seguro que desea ${accion} este administrador?`)) {
    return
  }

  try {
    // Enviar petición al servidor para cambiar estado
    const response = await fetch(API_ROUTES.admin.toggle(adminId), {
      method: 'PATCH',
      headers: {
        ...tokenUtils.getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    })

    // Verificar si la operación fue exitosa
    if (!response.ok) {
      throw new Error('Error al cambiar estado del administrador')
    }

    // Mostrar mensaje de éxito
    const mensaje = accion === 'activar' ? 'activado' : 'desactivado'
    alert(`Administrador ${mensaje} exitosamente`)

    // Recargar la lista para mostrar cambios
    await cargarAdministradores()
    renderizarAdministradores()
  } catch (error) {
    // Mostrar mensaje de error
    alert(`Error al ${accion} el administrador`)
  }
}
