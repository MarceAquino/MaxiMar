/**
 * MÓDULO: Confirmación específica para el carrito
 *
 * FUNCIONALIDADES:
 * - Proporciona una función para mostrar un modal de confirmación personalizado para acciones del carrito.
 * - Permite configurar título, mensaje, texto y estilo del botón de confirmación.
 * - Utiliza el módulo controladorModales para mostrar el modal.
 *
 * DEPENDENCIAS:
 * - mostrarConfirmacion del módulo controladorModales.js
 */

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
