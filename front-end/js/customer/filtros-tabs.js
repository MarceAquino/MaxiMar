let productosParaFiltrar = [] // Lista completa de productos disponibles
let funcionRenderizado = null // Función que dibuja los productos en pantalla
let mascotaActual = null // Filtro actual por mascota (null = todos)
let categoriaActual = null // Filtro actual por categoría (null = todas)

// ======================================================================
// FUNCIÓN PRINCIPAL: INICIALIZAR SISTEMA DE FILTROS
// ======================================================================
/**
 * Configura todo el sistema de filtros de productos
 * @param {Array} productos - Lista de todos los productos disponibles
 * @param {Function} renderizarProductos - Función que dibuja productos en pantalla
 */
function inicializarFiltros (productos, renderizarProductos) {
  console.log('🔍 Inicializando sistema de filtros...')

  // Guardar datos importantes para usar después
  productosParaFiltrar = productos
  funcionRenderizado = renderizarProductos

  // Configurar eventos de los elementos de la página
  configurarEventosCategorias()
  configurarEventosBotones()

  // Mostrar todos los productos al inicio
  if (funcionRenderizado) {
    funcionRenderizado(productosParaFiltrar)
    console.log('✅ Productos mostrados inicialmente')
  }
}

// ======================================================================
// CONFIGURAR EVENTOS DE TARJETAS DE CATEGORÍA
// ======================================================================
/**
 * Configura los clicks en las tarjetas de categorías
 * Cuando el usuario hace click en una categoría, se activa el filtro
 */
function configurarEventosCategorias () {
  console.log('🎯 Configurando eventos de categorías...')

  // Buscar todas las tarjetas de categoría en la página
  const tarjetasCategorias = document.querySelectorAll('.categoria-card')

  // Para cada tarjeta, agregar evento de click
  tarjetasCategorias.forEach(tarjeta => {
    tarjeta.addEventListener('click', function () {
      // Obtener datos de la tarjeta clickeada
      const mascota = this.dataset.mascota
      const categoria = this.dataset.categoria

      console.log(`📦 Seleccionada categoría: ${categoria} para ${mascota}`)

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

// ======================================================================
// CONFIGURAR EVENTOS DE BOTONES ESPECIALES
// ======================================================================
/**
 * Configura botones especiales como "Ver Todos" o filtros rápidos
 */
function configurarEventosBotones () {
  console.log('🔘 Configurando eventos de botones especiales...')

  // Buscar botones con datos de filtro
  const botones = document.querySelectorAll('button[data-mascota][data-categoria]')

  // Para cada botón, agregar evento de click
  botones.forEach(boton => {
    boton.addEventListener('click', function () {
      // Obtener datos del botón clickeado
      const mascota = this.dataset.mascota
      const categoria = this.dataset.categoria

      console.log(`🔘 Botón presionado: ${mascota} - ${categoria}`)

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

// ======================================================================
// FUNCIÓN PRINCIPAL DE FILTRADO
// ======================================================================
/**
 * Filtra los productos según los criterios seleccionados y los muestra
 * Esta es la función más importante del archivo
 */
function filtrarYMostrarProductos () {
  // Verificar que tenemos datos para trabajar
  if (!productosParaFiltrar.length || !funcionRenderizado) {
    console.log('⚠️ No hay productos o función de renderizado disponible')
    return
  }

  console.log(`🔍 Filtrando productos: mascota=${mascotaActual}, categoría=${categoriaActual}`)

  // Empezar con todos los productos
  let productosFiltrados = productosParaFiltrar
  // Aplicar filtro por mascota si está seleccionado
  if (mascotaActual) {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.tipo_mascota === mascotaActual
    )
    console.log(`📋 Después de filtrar por mascota: ${productosFiltrados.length} productos`)
  }

  // Aplicar filtro por categoría si está seleccionado
  if (categoriaActual) {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.categoria === categoriaActual
    )
    console.log(`📋 Después de filtrar por categoría: ${productosFiltrados.length} productos`)
  }

  // Mostrar los productos filtrados en pantalla
  funcionRenderizado(productosFiltrados)

  console.log(`✅ Mostrados ${productosFiltrados.length} productos filtrados`)
}

// ======================================================================
// CONFIGURAR EVENTOS DE NAVEGACIÓN ENTRE TABS
// ======================================================================
/**
 * Configura el comportamiento cuando el usuario cambia entre tabs
 * (Perros, Gatos, Ver Todos)
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 Configurando eventos de tabs...')

  // Buscar todos los tabs de mascotas
  const tabs = document.querySelectorAll('#mascotaTabs button[data-bs-toggle="pill"]')

  // Para cada tab, configurar evento cuando se muestra
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', function (event) {
      console.log(`🔄 Cambiando a tab: ${event.target.textContent}`)

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
          console.log('📋 Mostrando todos los productos')
        }
      }
    })
  })
})

// ======================================================================
// EXPORTAR FUNCIONES PARA USAR EN OTROS ARCHIVOS
// ======================================================================
export { inicializarFiltros }
