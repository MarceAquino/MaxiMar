// Auxiliar para formatear la respuesta de login de admin
function formatearRespuestaLoginAdmin (admin, token) {
  return {
    ok: true,
    mensaje: 'Login exitoso',
    admin: {
      id: admin.admin_id,
      email: admin.email,
      nombre: admin.nombre,
      rol: admin.rol,
      activo: admin.activo
    },
    token
  }
}

// Auxiliar para respuesta de error simple
function respuestaError (mensaje, status = 401) {
  return {
    ok: false,
    error: mensaje,
    status
  }
}

module.exports = {
  formatearRespuestaLoginAdmin,
  respuestaError
}
