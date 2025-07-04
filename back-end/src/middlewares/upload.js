// Middleware para subir imágenes de producto con Multer
// Guarda hasta 5 imágenes por producto en la carpeta front-end/img/nuevos-Producto
// Los archivos se guardan con nombres únicos para evitar sobrescrituras

const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, '../../../front-end/img/nuevos-Producto')
    cb(null, uploadsPath)
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp y nombre original
    const timestamp = Date.now()
    const extension = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, extension)
    const uniqueName = `${baseName}-${timestamp}${extension}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por archivo
    files: 5 // Máximo 5 archivos
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = /jpeg|jpg|png/
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeType = allowedTypes.test(file.mimetype)

    if (mimeType && extName) {
      return cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos JPG, JPEG y PNG'))
    }
  }
})

module.exports = upload
