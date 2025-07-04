/**
 * MÓDULO: Sistema de Filtros y Tabs
 *
 * Maneja el filtrado de productos por mascota y categoría en la página de productos.
 *
 * FUNCIONALIDADES:
 * - Filtrado por tipo de mascota (perros, gatos, todos)
 * - Filtrado por categoría (alimentos, juguetes, etc.)
 * - Manejo de tabs con Bootstrap
 * - Interfaz visual con tarjetas de categoría
 *
 * VARIABLES GLOBALES:
 * - productosParaFiltrar: Lista completa de productos
 * - funcionRenderizado: Función que dibuja los productos
 * - mascotaActual/categoriaActual: Filtros activos
 */

let productosParaFiltrar = [] // Lista completa de productos disponibles
let funcionRenderizado = null // Función que dibuja los productos en pantalla
let mascotaActual = null // Filtro actual por mascota (null = todos)
let categoriaActual = null // Filtro actual por categoría (null = todas)

/**
 * Inicializa el sistema de filtros con productos y función de renderizado
 * @param {Array} productos - Array de productos a filtrar
 * @param {Function} renderizarProductos - Función para mostrar productos
 */
function inicializarFiltros (productos, renderizarProductos) {
  // Guardar datos importantes para usar después
  productosParaFiltrar = productos
  funcionRenderizado = renderizarProductos

  // Configurar eventos de los elementos de la página
  configurarEventosCategorias()
  configurarEventosBotones()

  // Mostrar todos los productos al inicio
  if (funcionRenderizado) {
    funcionRenderizado(productosParaFiltrar)
  }
}

/**
 * Configura eventos de click en las tarjetas de categoría
 */
function configurarEventosCategorias () {
  // Buscar todas las tarjetas de categoría en la página
  const tarjetasCategorias = document.querySelectorAll('.categoria-card')

  // Para cada tarjeta, agregar evento de click
  tarjetasCategorias.forEach(tarjeta => {
    tarjeta.addEventListener('click', function () {
      // Obtener datos de la tarjeta clickeada
      const mascota = this.dataset.mascota
      const categoria = this.dataset.categoria

      // Quitar selección activa de todas las tarjetas del mismo panel
      const panelActual = this.closest('.tab-pane')
      panelActual.querySelectorAll('.categoria-card').forEach(t => t.classList.remove('active'))

      // Marcar esta tarjeta como activa
      this.classList.add('active')

      // Aplicar los filtros seleccionados
      mascotaActual = mascota
      categoriaActual = categoria
      filtrarYMostrarProductos()
    })
  })
}

/**
 * Configura eventos de click en botones con filtros especiales
 */
function configurarEventosBotones () {
  // Buscar botones con datos de filtro
  const botones = document.querySelectorAll('button[data-mascota][data-categoria]')

  // Para cada botón, agregar evento de click
  botones.forEach(boton => {
    boton.addEventListener('click', function () {
      // Obtener datos del botón clickeado
      const mascota = this.dataset.mascota
      const categoria = this.dataset.categoria

      // Limpiar selecciones activas del panel actual
      const panelActual = this.closest('.tab-pane')
      if (panelActual) {
        panelActual.querySelectorAll('.categoria-card').forEach(t => t.classList.remove('active'))
      }

      // Aplicar filtros (convertir "todos" a null)
      mascotaActual = mascota === 'todos' ? null : mascota
      categoriaActual = categoria === 'todos' ? null : categoria
      filtrarYMostrarProductos()
    })
  })
}

/**
 * Aplica los filtros activos y muestra los productos resultantes
 */
function filtrarYMostrarProductos () {
  // Verificar que tenemos datos para trabajar
  if (!productosParaFiltrar.length || !funcionRenderizado) {
    return
  }

  // Empezar con todos los productos
  let productosFiltrados = productosParaFiltrar

  // Aplicar filtro por mascota si está seleccionado
  if (mascotaActual) {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.tipo_mascota === mascotaActual
    )
  }

  // Aplicar filtro por categoría si está seleccionado
  if (categoriaActual) {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.categoria === categoriaActual
    )
  }

  // Mostrar los productos filtrados en pantalla
  funcionRenderizado(productosFiltrados)
}

/**
 * Configura eventos de cambio de tabs de Bootstrap
 * Limpia filtros al cambiar entre mascotas
 */
document.addEventListener('DOMContentLoaded', function () {
  // Buscar todos los tabs de mascotas
  const tabs = document.querySelectorAll('#mascotaTabs button[data-bs-toggle="pill"]')

  // Para cada tab, configurar evento cuando se muestra
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', function (event) {
      // Limpiar todos los filtros cuando se cambia de tab
      mascotaActual = null
      categoriaActual = null

      // Quitar todas las selecciones activas de categorías
      document.querySelectorAll('.categoria-card.active').forEach(card => {
        card.classList.remove('active')
      })

      // Si es el tab "Ver Todos", mostrar todos los productos
      if (event.target.id === 'todos-tab') {
        if (funcionRenderizado && productosParaFiltrar.length) {
          funcionRenderizado(productosParaFiltrar)
        }
      }
    })
  })
})

export { inicializarFiltros }
