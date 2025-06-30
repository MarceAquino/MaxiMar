// Middleware mínimo para subir imágenes de producto con Multer
// Guarda hasta 5 imágenes por producto en la carpeta front-end/img/nuevos-Producto
// Los archivos se guardan con su nombre original (pueden sobrescribirse si el nombre se repite)

const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../front-end/img/nuevos-Producto'),
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
})

module.exports = upload
