// Valida los datos de un producto antes de actualizar o crear

/**
 * Valida los campos de un producto para alta o edición.
 * Devuelve un array de errores si los datos no cumplen los requisitos.
 */
function validarProducto (datos, modo = 'crear') {
  const errores = []

  // Validar código
  if (!datos.codigo || typeof datos.codigo !== 'string' || datos.codigo.trim().length < 3 || datos.codigo.trim().length > 20) {
    errores.push('El código es obligatorio y debe tener entre 3 y 20 caracteres.')
  }

  // Validar nombre
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 3 || datos.nombre.trim().length > 100) {
    errores.push('El nombre es obligatorio y debe tener entre 3 y 100 caracteres.')
  }

  // Validar precio
  if (typeof datos.precio !== 'number' || isNaN(datos.precio) || datos.precio < 0.01) {
    errores.push('El precio debe ser un número mayor o igual a 0.01.')
  }

  // Validar stock
  if (typeof datos.stock !== 'number' || isNaN(datos.stock) || datos.stock < 0) {
    errores.push('El stock debe ser un número igual o mayor a 0.')
  }

  // Validar categoría
  const categoriasValidas = ['alimento', 'juguete']
  if (!datos.categoria || typeof datos.categoria !== 'string' || !categoriasValidas.includes(datos.categoria)) {
    errores.push('La categoría es obligatoria y debe ser "alimento" o "juguete".')
  }

  // Validar tipo de mascota
  const tiposMascotaValidos = ['perro', 'gato']
  if (!datos.tipo_mascota || typeof datos.tipo_mascota !== 'string' || !tiposMascotaValidos.includes(datos.tipo_mascota)) {
    errores.push('El tipo de mascota es obligatorio y debe ser "perro" o "gato".')
  }

  // Validar marca
  if (!datos.marca || typeof datos.marca !== 'string' || datos.marca.trim().length < 2 || datos.marca.trim().length > 50) {
    errores.push('La marca es obligatoria y debe tener entre 2 y 50 caracteres.')
  }

  // Validar urls (imágenes) solo en modo crear
  if (modo === 'crear') {
    if (!Array.isArray(datos.urls) || datos.urls.length === 0) {
      errores.push('Debe subir al menos una imagen del producto.')
    } else {
      // Validar tipo de archivo de imagen (solo extensiones permitidas)
      const extensionesValidas = ['.jpg', '.jpeg', '.png', '.webp']
      datos.urls.forEach((url, i) => {
        if (typeof url !== 'string' || !extensionesValidas.some(ext => url.toLowerCase().endsWith(ext))) {
          errores.push(`La imagen ${i + 1} no tiene un formato permitido (jpg, jpeg, png, webp).`)
        }
      })
    }
  } else if (modo === 'actualizar' && datos.urls) {
    // Si se envían nuevas imágenes en actualización, validar formato
    if (Array.isArray(datos.urls)) {
      const extensionesValidas = ['.jpg', '.jpeg', '.png', '.webp']
      datos.urls.forEach((url, i) => {
        if (typeof url !== 'string' || !extensionesValidas.some(ext => url.toLowerCase().endsWith(ext))) {
          errores.push(`La imagen ${i + 1} no tiene un formato permitido (jpg, jpeg, png, webp).`)
        }
      })
    }
  }

  // Validar atributos_especificos (opcional)
  if (datos.atributos_especificos && typeof datos.atributos_especificos !== 'object') {
    errores.push('Los atributos específicos deben ser un objeto.')
  }

  return {
    esValido: errores.length === 0,
    errores
  }
}

module.exports = validarProducto
