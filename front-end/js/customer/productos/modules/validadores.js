// modules/validadores.js

// Objeto con funciones de validación
export const validarProducto = {
  validarId (id) {
    return !isNaN(id) && id > 0
  },

  validarDatosCompletos (producto) {
    return producto.producto_id &&
             producto.nombre &&
             producto.precio !== undefined &&
             producto.precio !== null
  }
}

// Función para validar stock
export function validarStock (producto) {
  return producto.stock > 0
}
