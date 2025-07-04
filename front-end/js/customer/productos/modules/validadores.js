/**
 * MÓDULO: Validadores de Productos
 *
 * Contiene funciones para validar datos de productos antes de procesarlos.
 *
 * FUNCIONALIDADES:
 * - Validación de IDs de productos
 * - Validación de datos completos del producto
 * - Validación de stock disponible
 *
 * USO:
 * - Antes de agregar productos al carrito
 * - Antes de mostrar productos en la interfaz
 * - Para asegurar integridad de datos
 */

/**
 * Objeto con funciones de validación para productos
 */
export const validarProducto = {
  /**
   * Valida que el ID del producto sea un número positivo válido
   * @param {number} id - ID del producto a validar
   * @returns {boolean} - true si el ID es válido
   */
  validarId (id) {
    return !isNaN(id) && id > 0
  },

  /**
   * Valida que el producto tenga todos los datos necesarios
   * @param {Object} producto - Objeto producto a validar
   * @returns {boolean} - true si tiene todos los datos requeridos
   */
  validarDatosCompletos (producto) {
    return producto.producto_id &&
            producto.nombre &&
            producto.precio !== undefined &&
            producto.precio !== null
  }
}

/**
 * Valida que el producto tenga stock disponible
 * @param {Object} producto - Producto a validar
 * @returns {boolean} - true si hay stock disponible
 */
export function validarStock (producto) {
  return producto.stock > 0
}
