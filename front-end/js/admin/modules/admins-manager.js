import { API_ROUTES, tokenUtils } from '../../config/api.js'
import { DashboardState } from './dashboard-state.js'

export async function cargarAdministradores () {
  console.log('📦 Cargando administradores...')
  console.log('🔗 URL:', API_ROUTES.admin.list)
  console.log('🔑 Headers:', tokenUtils.getAuthHeaders())

  try {
    const response = await fetch(API_ROUTES.admin.list, {
      headers: tokenUtils.getAuthHeaders()
    })

    console.log('📡 Response status:', response.status)
    console.log('📡 Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response:', errorText)
      throw new Error(`Error al obtener administradores del servidor: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📡 Raw response data:', data)

    // El backend devuelve { message, admins }, extraemos el array de admins
    const todosLosAdmins = data.admins || data || []

    // Filtrar para no mostrar superadmins en la lista
    const administradores = todosLosAdmins.filter(admin => admin.rol !== 'superadmin')

    console.log(`✅ ${administradores.length} administradores cargados (${todosLosAdmins.length - administradores.length} superadmins filtrados):`, administradores)

    DashboardState.setAdministradores(administradores)

    // Actualizar contador
    const contador = document.getElementById('contadorAdministradores')
    if (contador) {
      contador.textContent = `${administradores.length} administradores`
    }
  } catch (error) {
    console.error('❌ Error cargando administradores:', error)
    DashboardState.setAdministradores([])

    // Mostrar error en la interfaz
    const contenedor = document.getElementById('contenedorAdministradores')
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error al cargar administradores: ${error.message}
          </div>
        </div>
      `
    }
  }
}

export function renderizarAdministradores () {
  const contenedor = document.getElementById('contenedorAdministradores')

  if (!contenedor) {
    console.warn('⚠️ Contenedor de administradores no encontrado')
    return
  }

  contenedor.innerHTML = ''

  const administradores = DashboardState.getAdministradores()

  if (administradores.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No hay administradores registrados</h5>
      </div>
    `
    return
  }

  contenedor.className = 'row g-4'

  administradores.forEach(admin => {
    const div = document.createElement('div')
    div.className = 'col-lg-2-4 col-md-4 col-12'

    const estadoClass = admin.activo ? 'activo' : 'inactivo'
    const estadoTexto = admin.activo ? 'Activo' : 'Inactivo'
    const botonTexto = admin.activo ? 'Desactivar' : 'Activar'
    const botonClass = admin.activo ? 'btn-warning' : 'btn-success'

    div.innerHTML = `
      <div class="admin-card">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h5 class="mb-0">${admin.nombre}</h5>
          <span class="admin-status ${estadoClass}">${estadoTexto}</span>
        </div>
        <p class="text-muted mb-2">
          <i class="fas fa-envelope me-2"></i>${admin.email}
        </p>
        <p class="text-muted mb-3">
          <i class="fas fa-user-tag me-2"></i>Rol: ${admin.rol}
        </p>
        <div class="d-flex gap-2">
          <button class="btn ${botonClass} btn-sm" onclick="toggleAdminStatus(${admin.admin_id}, ${admin.activo})">
            <i class="fas ${admin.activo ? 'fa-ban' : 'fa-check'} me-1"></i>${botonTexto}
          </button>
        </div>
      </div>
    `

    contenedor.appendChild(div)
  })
}

export async function toggleAdminStatus (adminId, estadoActual) {
  const accion = estadoActual ? 'desactivar' : 'activar'

  if (!confirm(`¿Está seguro que desea ${accion} este administrador?`)) {
    return
  }

  try {
    const response = await fetch(API_ROUTES.admin.toggle(adminId), {
      method: 'PATCH',
      headers: {
        ...tokenUtils.getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Error al cambiar estado del administrador')
    }

    alert(`✅ Administrador ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`)
    await cargarAdministradores()
    renderizarAdministradores()
  } catch (error) {
    console.error('❌ Error al cambiar estado del administrador:', error)
    alert(`❌ Error al ${accion} el administrador`)
  }
}

// Exponer función globalmente para que funcione desde HTML
window.toggleAdminStatus = toggleAdminStatus
