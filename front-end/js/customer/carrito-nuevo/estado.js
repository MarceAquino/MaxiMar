/**
 * Gestor de estado del carrito
 * Maneja el estado local del carrito y la sincronización con localStorage
 */

class EstadoCarrito {
  constructor () {
    this.items = []
    this.total = 0
    this.storageKey = 'maximar_carrito'
    this.cargarDesdeStorage()
  }

  // Cargar carrito desde localStorage
  cargarDesdeStorage () {
    try {
      const carritoGuardado = localStorage.getItem(this.storageKey)
      if (carritoGuardado) {
        const datos = JSON.parse(carritoGuardado)
        this.items = datos.items || []
        this.total = datos.total || 0
        console.log('🛒 Carrito cargado desde localStorage:', this.items.length, 'items')
      }
    } catch (error) {
      console.error('❌ Error cargando carrito:', error)
      this.items = []
      this.total = 0
    }
  }

  // Guardar carrito en localStorage
  guardarEnStorage () {
    try {
      const datos = {
        items: this.items,
        total: this.total,
        fecha: new Date().toISOString()
      }
      localStorage.setItem(this.storageKey, JSON.stringify(datos))
      console.log('💾 Carrito guardado en localStorage')
    } catch (error) {
      console.error('❌ Error guardando carrito:', error)
    }
  }

  // Obtener todos los items
  obtenerItems () {
    return [...this.items] // Retorna copia para evitar mutaciones
  }

  // Obtener total
  obtenerTotal () {
    return this.total
  }

  // Obtener cantidad total de items
  obtenerCantidadTotal () {
    return this.items.reduce((total, item) => total + item.cantidad, 0)
  }

  // Buscar item por ID
  buscarItem (id) {
    return this.items.find(item => item.id === parseInt(id))
  }

  // Agregar o actualizar item
  agregarItem (producto, cantidad = 1) {
    const itemExistente = this.buscarItem(producto.id)

    if (itemExistente) {
      itemExistente.cantidad += cantidad
      console.log(`➕ Cantidad actualizada para ${producto.nombre}: ${itemExistente.cantidad}`)
    } else {
      const nuevoItem = {
        id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        cantidad,
        imagen: producto.imagen || producto.imagenes?.[0] || '/front-end/img/notFount.png',
        stock: producto.stock || 999
      }
      this.items.push(nuevoItem)
      console.log(`✅ Producto agregado: ${producto.nombre}`)
    }

    this.calcularTotal()
    this.guardarEnStorage()
  }

  // Actualizar cantidad de un item
  actualizarCantidad (id, nuevaCantidad) {
    const item = this.buscarItem(id)
    if (item && nuevaCantidad > 0) {
      item.cantidad = nuevaCantidad
      console.log(`🔄 Cantidad actualizada: ${item.nombre} -> ${nuevaCantidad}`)
      this.calcularTotal()
      this.guardarEnStorage()
      return true
    }
    return false
  }

  // Eliminar item
  eliminarItem (id) {
    const index = this.items.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      const item = this.items[index]
      this.items.splice(index, 1)
      console.log(`🗑️ Producto eliminado: ${item.nombre}`)
      this.calcularTotal()
      this.guardarEnStorage()
      return true
    }
    return false
  }

  // Limpiar carrito
  limpiar () {
    this.items = []
    this.total = 0
    localStorage.removeItem(this.storageKey)
    console.log('🧹 Carrito limpiado')
  }

  // Calcular total
  calcularTotal () {
    this.total = this.items.reduce((total, item) => {
      return total + (item.precio * item.cantidad)
    }, 0)
    console.log('💰 Total calculado:', this.total)
  }

  // Verificar si el carrito está vacío
  estaVacio () {
    return this.items.length === 0
  }
}

// Instancia global del estado
const estadoCarrito = new EstadoCarrito()

export default estadoCarrito
