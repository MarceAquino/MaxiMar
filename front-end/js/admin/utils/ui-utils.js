// Función simple para mostrar errores
export function mostrarErrores (errores) {
  if (!errores || errores.length === 0) {
    return
  }

  let mensaje = 'Se encontraron los siguientes errores:\n\n'

  errores.forEach((error, index) => {
    mensaje += `${index + 1}. ${error}\n`
  })

  mensaje += '\nCorrija estos errores e intente nuevamente.'
  alert(mensaje)
}
