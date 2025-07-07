/**
 * Gestor de interfaz del dashboard
 * Maneja la configuración de la interfaz según el rol del usuario
 * y la navegación entre diferentes secciones
 */

import { cargarAdministradores, renderizarAdministradores } from './admins-manager.js'
import { DashboardState } from './dashboard-state.js'
import { aplicarFiltros } from './products-manager.js'
import { cargarVentas, renderizarVentas } from './sales-manager.js'

/**
 * Configura la interfaz según el rol del usuario logueado
 * SuperAdmin: acceso completo a todas las funciones
 * Admin: acceso limitado, sin gestión de administradores
 */
export function configurarInterfazSegunRol () {
  const usuarioActual = DashboardState.getUsuarioActual()

  if (!usuarioActual) return

  const rolUsuario = document.getElementById('rolUsuario')
  const tituloPanel = document.getElementById('tituloPanel')
  const linkRegistrarAdmin = document.getElementById('link-registrar-admin')
  const linkAdministradores = document.getElementById('link-administradores')
  const linkVentas = document.getElementById('link-ventas')

  if (usuarioActual.rol === 'superadmin') {
    configurarSuperAdmin(rolUsuario, tituloPanel)
    habilitarEnlaces([linkRegistrarAdmin, linkAdministradores, linkVentas])
  } else {
    configurarAdmin(rolUsuario, tituloPanel)
    deshabilitarEnlaces([linkRegistrarAdmin, linkAdministradores, linkVentas])
  }

  configurarNavegacionSidebar()
}

/**
 * Configura la interfaz para SuperAdmin
 */
function configurarSuperAdmin (rolUsuario, tituloPanel) {
  if (rolUsuario) {
    rolUsuario.textContent = 'Super Admin'
    rolUsuario.className = 'badge bg-danger'
  }
  if (tituloPanel) {
    tituloPanel.textContent = 'Panel SuperAdmin'
    tituloPanel.className = 'text-center py-3 mb-0 fw-bold text-danger'
  }
}

/**
 * Configura la interfaz para Admin regular
 */
function configurarAdmin (rolUsuario, tituloPanel) {
  if (rolUsuario) {
    rolUsuario.textContent = 'Admin'
    rolUsuario.className = 'badge bg-primary'
  }
  if (tituloPanel) {
    tituloPanel.textContent = 'Panel Admin'
    tituloPanel.className = 'text-center py-3 mb-0 fw-bold text-primary'
  }
}

/**
 * Habilita una lista de enlaces del sidebar
 */
function habilitarEnlaces (enlaces) {
  enlaces.forEach(enlace => {
    if (enlace) {
      enlace.classList.remove('disabled')
      enlace.style.color = ''
      enlace.style.cursor = 'pointer'
      enlace.style.opacity = '1'
    }
  })
}

/**
 * Deshabilita una lista de enlaces del sidebar
 */
function deshabilitarEnlaces (enlaces) {
  enlaces.forEach(enlace => {
    if (enlace) {
      enlace.classList.add('disabled')
      enlace.style.color = '#6c757d'
      enlace.style.cursor = 'not-allowed'
      enlace.style.opacity = '0.5'
    }
  })
}

/**
 * Configura los event listeners principales del dashboard
 */
export function configurarEventListeners () {
  document.getElementById('buscarProducto').addEventListener('input', aplicarFiltros)
  document.getElementById('filtroCategoria').addEventListener('change', aplicarFiltros)
  document.getElementById('filtroMascota').addEventListener('change', aplicarFiltros)
  document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros)

  const ordenarVentas = document.getElementById('ordenarVentas')
  if (ordenarVentas) {
    ordenarVentas.addEventListener('change', renderizarVentas)
  }
}

/**
 * Configura la navegación del sidebar con event listeners
 */
function configurarNavegacionSidebar () {
  const sidebarLinks = document.querySelectorAll('.sidebar-link')

  sidebarLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault()

      if (link.classList.contains('disabled')) {
        return
      }

      const seccion = link.getAttribute('data-section')
      if (seccion) {
        await cambiarSeccion(seccion)

        if (seccion !== 'crear-producto' && seccion !== 'registrar-admin') {
          sidebarLinks.forEach(l => l.classList.remove('active'))
          link.classList.add('active')
        }
      }
    })
  })
}

/**
 * Cambia la sección activa del dashboard
 * @param {string} nuevaSeccion - Nombre de la sección a mostrar
 */
export async function cambiarSeccion (nuevaSeccion) {
  // Verificar si es una redirección a otra página
  if (nuevaSeccion === 'crear-producto') {
    window.location.href = '/front-end/html/admin/crearProducto.html'
    return
  }

  if (nuevaSeccion === 'registrar-admin') {
    window.location.href = '/front-end/html/admin/registrarAdmin.html'
    return
  }

  // Ocultar todas las secciones del dashboard
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none'
  })

  // Mostrar la sección seleccionada
  const seccionElement = document.getElementById(`seccion-${nuevaSeccion}`)
  if (seccionElement) {
    seccionElement.style.display = 'block'
    DashboardState.setSeccionActiva(nuevaSeccion)

    // Cargar datos específicos de cada sección
    switch (nuevaSeccion) {
      case 'administradores':
        await cargarAdministradores()
        renderizarAdministradores()
        break
      case 'ventas':
        await cargarVentas()
        renderizarVentas()
        break
    }
  }
}
