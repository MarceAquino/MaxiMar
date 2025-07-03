// Middleware de debugging para entender el problema de duplicación de imágenes
const debugUpload = (req, res, next) => {
  console.log('🔍 DEBUG UPLOAD - Middleware ejecutado')
  console.log('🔍 DEBUG UPLOAD - req.body antes de multer:', req.body)
  console.log('🔍 DEBUG UPLOAD - req.files antes de multer:', req.files)
  console.log('🔍 DEBUG UPLOAD - Content-Type:', req.headers['content-type'])

  // Continuar al siguiente middleware (upload)
  next()
}

module.exports = debugUpload
