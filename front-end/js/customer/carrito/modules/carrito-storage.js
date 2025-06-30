export function cargarCarrito () {
  const carritoGuardado = localStorage.getItem('carrito')
  return carritoGuardado ? JSON.parse(carritoGuardado) : []
}

export function guardarCarrito (carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito))
}
