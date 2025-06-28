// === ELEMENTOS DOM ===
const elements = {
  searchInput: document.getElementById('search-input'),
  filtrosCategoria: document.querySelectorAll('.filtro-categoria'),
  filtrosMascota: document.querySelectorAll('.filtro-mascota'),
  resetButton: document.getElementById('reset-filters')
}

// Variables globales para los filtros
let productosParaFiltrar = []
let funcionRenderizado = null

// === FILTROS ===
function inicializarFiltros (productos, renderizarProductos) {
  productosParaFiltrar = productos
  funcionRenderizado = renderizarProductos

  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce(filtrarProductos, 300))
  }

  elements.filtrosCategoria.forEach(f => f.addEventListener('change', filtrarProductos))
  elements.filtrosMascota.forEach(f => f.addEventListener('change', filtrarProductos))

  if (elements.resetButton) {
    elements.resetButton.addEventListener('click', () => {
      elements.filtrosCategoria.forEach(f => { f.checked = false })
      elements.filtrosMascota.forEach(f => { f.checked = false })
      if (elements.searchInput) elements.searchInput.value = ''
      filtrarProductos()
    })
  }
}

function filtrarProductos () {
  if (!productosParaFiltrar.length || !funcionRenderizado) return

  const texto = (elements.searchInput?.value || '').toLowerCase().trim()
  const categorias = [...elements.filtrosCategoria].filter(f => f.checked).map(f => f.value)
  const mascotas = [...elements.filtrosMascota].filter(f => f.checked).map(f => f.value)

  const filtrados = productosParaFiltrar.filter(p => {
    const textToSearch = [p.nombre, p.marca, p.categoria, p.tipo_mascota]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return (
      (texto === '' || textToSearch.includes(texto)) &&
        (categorias.length === 0 || categorias.includes(p.categoria)) &&
        (mascotas.length === 0 || mascotas.includes(p.tipo_mascota))
    )
  })

  funcionRenderizado(filtrados)
}

// === UTILIDADES ===
function debounce (fn, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

// === EXPORTAR FUNCIONES ===
export { filtrarProductos, inicializarFiltros }
