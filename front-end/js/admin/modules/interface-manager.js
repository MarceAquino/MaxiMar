import { logout } from '../auth-guard.js'
import { cargarAdministradores, renderizarAdministradores } from './admins-manager.js'
import { DashboardState } from './dashboard-state.js'
import { aplicarFiltros } from './products-manager.js'
import { cargarVentas, renderizarVentas } from './sales-manager.js'

export function configurarInterfazSegunRol () {
  const usuarioActual = DashboardState.getUsuarioActual()
  console.log('👤 Configurando interfaz para:', usuarioActual?.nombre)

  if (usuarioActual) {
    // Configurar elementos de la barra lateral según el rol
    const rolUsuario = document.getElementById('rolUsuario')
    const tituloPanel = document.getElementById('tituloPanel')
    const linkRegistrarAdmin = document.getElementById('link-registrar-admin')
    const linkAdministradores = document.getElementById('link-administradores')
    const linkVentas = document.getElementById('link-ventas')

    if (usuarioActual.rol === 'superadmin') {
      // Configuración para SuperAdmin
      if (rolUsuario) {
        rolUsuario.textContent = 'Super Admin'
        rolUsuario.className = 'badge bg-danger'
      }
      if (tituloPanel) {
        tituloPanel.textContent = 'Panel SuperAdmin'
        tituloPanel.className = 'text-center py-3 mb-0 fw-bold text-danger'
      }

      // Habilitar todas las opciones para SuperAdmin
      enableSidebarLink(linkRegistrarAdmin)
      enableSidebarLink(linkAdministradores)
      enableSidebarLink(linkVentas)

      console.log('✅ Configuración SuperAdmin aplicada')
    } else {
      // Configuración para Admin regular
      if (rolUsuario) {
        rolUsuario.textContent = 'Admin'
        rolUsuario.className = 'badge bg-primary'
      }
      if (tituloPanel) {
        tituloPanel.textContent = 'Panel Admin'
        tituloPanel.className = 'text-center py-3 mb-0 fw-bold text-primary'
      }

      // Deshabilitar opciones restringidas para Admin
      disableSidebarLink(linkRegistrarAdmin)
      disableSidebarLink(linkAdministradores)
      disableSidebarLink(linkVentas)

      console.log('✅ Configuración Admin aplicada')
    }

    // Configurar navegación de sidebar para ambos roles
    configurarNavegacionSidebar()
  }
}

// Función para habilitar un enlace del sidebar
function enableSidebarLink (linkElement) {
  if (linkElement) {
    linkElement.classList.remove('disabled')
    linkElement.style.color = ''
    linkElement.style.cursor = 'pointer'
    linkElement.style.opacity = '1'
  }
}

// Función para deshabilitar un enlace del sidebar
function disableSidebarLink (linkElement) {
  if (linkElement) {
    linkElement.classList.add('disabled')
    linkElement.style.color = '#6c757d'
    linkElement.style.cursor = 'not-allowed'
    linkElement.style.opacity = '0.5'
  }
}

export function configurarEventListeners () {
  // Filtros de búsqueda
  document.getElementById('buscarProducto').addEventListener('input', aplicarFiltros)
  document.getElementById('filtroCategoria').addEventListener('change', aplicarFiltros)
  document.getElementById('filtroMascota').addEventListener('change', aplicarFiltros)
  document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros)

  // Botón de logout
  document.getElementById('logoutBtn').addEventListener('click', logout)

  // Configurar ordenamiento de ventas si el elemento existe
  const ordenarVentas = document.getElementById('ordenarVentas')
  if (ordenarVentas) {
    ordenarVentas.addEventListener('change', (e) => {
      renderizarVentas()
    })
  }
}

function configurarNavegacionSidebar () {
  const sidebarLinks = document.querySelectorAll('.sidebar-link')

  console.log('🔧 Configurando navegación sidebar, links encontrados:', sidebarLinks.length)

  sidebarLinks.forEach(link => {
    console.log('🔗 Configurando link:', link.getAttribute('data-section'))
    link.addEventListener('click', async (e) => {
      e.preventDefault()

      // Verificar si el enlace está deshabilitado
      if (link.classList.contains('disabled')) {
        console.log('⚠️ Enlace deshabilitado, no se ejecuta acción')
        return
      }

      const seccion = link.getAttribute('data-section')
      console.log('🖱️ Click en sección:', seccion)

      if (seccion) {
        await cambiarSeccion(seccion)

        // Actualizar estado activo del menú (solo si no es una redirección)
        if (seccion !== 'crear-producto' && seccion !== 'registrar-admin') {
          sidebarLinks.forEach(l => l.classList.remove('active'))
          link.classList.add('active')
        }
      }
    })
  })
}

export async function cambiarSeccion (nuevaSeccion) {
  console.log('🔄 Cambiando a sección:', nuevaSeccion)

  // Verificar si es una redirección directa (no una sección del dashboard)
  if (nuevaSeccion === 'crear-producto' || nuevaSeccion === 'registrar-admin') {
    // Estas opciones redirigen a otras páginas, no son secciones del dashboard
    switch (nuevaSeccion) {
      case 'crear-producto':
        console.log('🌐 Redirigiendo a create.html...')
        console.log('🌐 URL actual:', window.location.href)
        console.log('🌐 Nueva URL:', '/front-end/html/admin/create.html')
        window.location.href = '/front-end/html/admin/create.html'
        return
      case 'registrar-admin':
        console.log('🌐 Redirigiendo a register.html...')
        console.log('🌐 URL actual:', window.location.href)
        console.log('🌐 Nueva URL:', '/front-end/html/admin/register.html')
        window.location.href = '/front-end/html/admin/register.html'
        return
    }
  }

  // Para secciones del dashboard (productos, administradores, ventas)
  // Ocultar todas las secciones
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none'
  })

  // Mostrar la sección seleccionada
  const seccionElement = document.getElementById(`seccion-${nuevaSeccion}`)
  if (seccionElement) {
    seccionElement.style.display = 'block'
    DashboardState.setSeccionActiva(nuevaSeccion)

    // Cargar datos según la sección
    switch (nuevaSeccion) {
      case 'administradores':
        await cargarAdministradores()
        renderizarAdministradores()
        break
      case 'ventas':
        await cargarVentas()
        renderizarVentas()
        break
      case 'productos':
        // Ya está visible por defecto, no necesita acción adicional
        break
      default:
        console.warn('⚠️ Sección no reconocida:', nuevaSeccion)
    }
  } else {
    console.warn('⚠️ Elemento de sección no encontrado:', `seccion-${nuevaSeccion}`)
  }
}
