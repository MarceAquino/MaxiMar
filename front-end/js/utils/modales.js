import { mostrarConfirmacion } from './controladorModales.js'

/**
 * Confirmación específica para vaciar carrito.
 * @returns {Promise<boolean>} - true si confirma vaciar
 */
async function confirmarModal (tituloModal, mensajeModal, btnConfirmar, tipoBtnconfirmar) {
  return await mostrarConfirmacion({
    titulo: tituloModal,
    mensaje: mensajeModal,
    botonConfirmar: btnConfirmar,
    botonCancelar: 'Cancelar',
    tipoConfirmar: tipoBtnconfirmar
  })
}

export { confirmarModal }
