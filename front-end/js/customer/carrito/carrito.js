import { cargarProductos } from './modules/carrito-api.js'
import { inicializarCarrito } from './modules/carrito-manager.js'
import { inicializarPaginaCarrito } from './modules/carrito-render.js'
import { obtenerPaginaActual } from './modules/carrito-utils.js'

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  await cargarProductos()
  inicializarCarrito()

  if (obtenerPaginaActual() === 'carrito') {
    await inicializarPaginaCarrito()
  }
})

// Exportaciones (si son necesarias para otros módulos)
export { inicializarPaginaCarrito }
