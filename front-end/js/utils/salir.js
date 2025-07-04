/**
 * MANEJO DE BOTÓN DE SALIR/LOGOUT
 *
 * Funcionalidad:
 * - Detecta clicks en botones con ID "logoutBtn"
 * - Limpia completamente el almacenamiento del navegador
 * - Redirige al usuario al destino apropiado según el contexto
 *
 * Contextos soportados:
 * - Admin: Redirige al login de administrador
 * - Cliente: Redirige a la página principal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Buscar el botón de logout en la página
  const botonSalir = document.getElementById('logoutBtn')

  if (botonSalir) {
    botonSalir.addEventListener('click', (e) => {
      // Prevenir comportamiento por defecto del enlace
      e.preventDefault()

      // Confirmar acción del usuario
      if (confirm('¿Estás seguro que quieres salir?')) {
        /**
         * LIMPIEZA COMPLETA DE DATOS
         *
         * sessionStorage.clear():
         * - Elimina tokens de administrador
         * - Elimina datos temporales de sesión
         *
         * localStorage.clear():
         * - Elimina carrito del usuario
         * - Elimina preferencias guardadas (tema, etc.)
         * - Elimina cualquier dato persistente
         */
        sessionStorage.clear()
        localStorage.clear()

        /**
         * REDIRECCIÓN INTELIGENTE
         *
         * Detecta el contexto actual y redirige apropiadamente:
         * - Si URL contiene '/admin/' → Login de administrador
         * - En cualquier otro caso → Página principal
         */
        const esAdmin = window.location.pathname.includes('/admin/')
        const destino = esAdmin ? '/front-end/html/admin/login.html' : '/front-end/index.html'
        window.location.href = destino
      }
    })
  }
})
