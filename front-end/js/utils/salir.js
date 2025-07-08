/**
 * MANEJO DE BOTÓN DE SALIR/LOGOUT
 *
 * Funcionalidad:
 * - Detecta clicks en botones con ID "logoutBtn"
 * - Limpia completamente el almacenamiento del navegador
 * - Redirige al usuario al destino apropiado según el contexto
 *
 * DEPENDENCIAS:
 * - confirmarModal para modales de confirmación.
 */

import { confirmarModal } from './modales.js'

document.addEventListener('DOMContentLoaded', () => {
  // Buscar el botón de logout en la página
  const botonSalir = document.getElementById('logoutBtn')

  if (botonSalir) {
    botonSalir.addEventListener('click', async (e) => {
      // Prevenir comportamiento por defecto del enlace
      e.preventDefault()

      // Creacion de modal para confirmar crear producto.
      const confirmar = await confirmarModal('Salir', 'Esta seguro que desea salir?', 'Salir', 'peligro')
      if (!confirmar) {
        return
      }
      /**
         * LIMPIEZA ESPECÍFICA SEGÚN CONTEXTO
         *
         * Para admin: limpia tokens y datos de sesión
         * Para cliente: usa la función específica de customer-auth
         */
      const esAdmin = window.location.pathname.includes('/admin/')

      if (esAdmin) {
        // Limpieza para administradores
        sessionStorage.clear()
        localStorage.clear()
      } else {
        // Limpieza para clientes (usa la función específica si está disponible)
        if (window.customerAuth && window.customerAuth.limpiarSesionCliente) {
          window.customerAuth.limpiarSesionCliente()
        } else {
          // Fallback: limpieza manual para clientes
          localStorage.removeItem('nombreUsuario')
          localStorage.removeItem('carrito')
        }
      }
      /**
         * REDIRECCIÓN INTELIGENTE
         *
         * Detecta el contexto actual y redirige apropiadamente:
         * - Si URL contiene '/admin/' → Login de administrador
         * - En cualquier otro caso → Página principal
         */
      const destino = esAdmin ? '/front-end/html/admin/loginAdmin.html' : '/front-end/index.html'
      window.location.href = destino
    })
  }
})
