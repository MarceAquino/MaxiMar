// Middleware de debugging que se ejecuta después de multer
const debugPostUpload = (req, res, next) => {
  console.log('🔍 DEBUG POST-UPLOAD - Middleware ejecutado')
  console.log('🔍 DEBUG POST-UPLOAD - req.files después de multer:', req.files ? req.files.length : 0)

  if (req.files && req.files.length > 0) {
    req.files.forEach((file, index) => {
      console.log(`🔍 DEBUG POST-UPLOAD - Archivo ${index + 1}:`, {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        fieldname: file.fieldname,
        mimetype: file.mimetype,
        path: file.path
      })
    })
  }

  console.log('🔍 DEBUG POST-UPLOAD - req.body después de multer:', req.body)

  // Continuar al controlador
  next()
}

module.exports = debugPostUpload
