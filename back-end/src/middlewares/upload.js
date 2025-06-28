const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// Función para crear directorio si no existe
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Función para calcular el hash MD5 de un archivo
const calculateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash('md5')
  hashSum.update(fileBuffer)
  return hashSum.digest('hex')
}

// Función para buscar imágenes duplicadas por hash y nombre
const findDuplicateImage = (uploadPath, fileHash, originalName) => {
  console.log('🔍 Buscando imagen duplicada...')
  console.log(`   - Hash del archivo: ${fileHash}`)
  console.log(`   - Nombre original: ${originalName}`)

  try {
    const files = fs.readdirSync(uploadPath)
    console.log(`   - Archivos en directorio: ${files.length}`)

    // Limpiar el nombre original para comparación
    const cleanOriginalName = originalName.toLowerCase().replace(/[^a-zA-Z0-9.]/g, '-')

    for (const file of files) {
      const filePath = path.join(uploadPath, file)

      // Solo verificar archivos de imagen
      if (fs.statSync(filePath).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
        try {
          const existingHash = calculateFileHash(filePath)

          // Verificación por hash (contenido idéntico)
          if (existingHash === fileHash) {
            console.log(`✅ Imagen duplicada encontrada por hash: ${file}`)
            return `nuevos-Producto/${file}`
          }

          // Verificación adicional por nombre similar (opcional)
          const cleanFileName = file.toLowerCase().replace(/[^a-zA-Z0-9.]/g, '-')
          if (cleanFileName.includes(cleanOriginalName.split('.')[0]) ||
              cleanOriginalName.includes(cleanFileName.split('.')[0])) {
            // Si los nombres son similares, verificar si el contenido es muy parecido
            console.log(`🔍 Nombres similares detectados: ${file} vs ${originalName}`)
          }
        } catch (error) {
          console.error(`❌ Error calculando hash de ${file}:`, error.message)
        }
      }
    }

    console.log('❌ No se encontró imagen duplicada')
    return null
  } catch (error) {
    console.error('❌ Error buscando duplicados:', error.message)
    return null
  }
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Directorio único para todos los productos nuevos
    const uploadDir = path.join(__dirname, '../../../front-end/img/nuevos-Producto')

    // Asegurar que el directorio existe
    ensureDirectoryExists(uploadDir)

    console.log('📁 Guardando imagen en:', uploadDir)

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname).toLowerCase()
    const baseName = path.basename(file.originalname, ext)

    // Limpiar el nombre base (remover caracteres especiales)
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

    const fileName = `${cleanBaseName}-${uniqueSuffix}${ext}`
    cb(null, fileName)
  }
})

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos de imagen (PNG, JPG, JPEG)'))
  }
}

// Configuración de multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 5 // Máximo 5 archivos
  },
  fileFilter
})

// Middleware para manejar múltiples imágenes
const uploadProductImages = upload.array('imagenes', 5)

// Middleware wrapper para mejor manejo de errores
const handleImageUpload = (req, res, next) => {
  console.log('📸 Iniciando middleware de subida de imágenes...')

  uploadProductImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('❌ Error de Multer:', err.code, err.message)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: 'El archivo es demasiado grande. Máximo 5MB por imagen.'
        })
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: 'Demasiados archivos. Máximo 5 imágenes por producto.'
        })
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: 'Campo de archivo inesperado.'
        })
      }
      return res.status(400).json({
        error: 'UPLOAD_ERROR',
        message: 'Error en la subida de archivos: ' + err.message
      })
    } else if (err) {
      console.error('❌ Error general en subida:', err.message)
      return res.status(400).json({
        error: 'UPLOAD_ERROR',
        message: err.message
      })
    }

    console.log('📁 Archivos procesados por multer:', req.files?.length || 0)

    // Si no hay archivos subidos
    if (!req.files || req.files.length === 0) {
      console.log('❌ No se recibieron archivos')
      return res.status(400).json({
        error: 'NO_FILES',
        message: 'Debe subir al menos una imagen del producto.'
      })
    }

    console.log('✅ Middleware de imágenes completado exitosamente')
    req.files.forEach((file, index) => {
      console.log(`📄 Archivo ${index + 1}: ${file.filename} -> ${file.path}`)
    })

    next()
  })
}

// Middleware wrapper para subida opcional (para updates)
const handleOptionalImageUpload = (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: 'El archivo es demasiado grande. Máximo 5MB por imagen.'
        })
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: 'Demasiados archivos. Máximo 5 imágenes por producto.'
        })
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: 'Campo de archivo inesperado.'
        })
      }
      return res.status(400).json({
        error: 'UPLOAD_ERROR',
        message: 'Error en la subida de archivos: ' + err.message
      })
    } else if (err) {
      return res.status(400).json({
        error: 'UPLOAD_ERROR',
        message: err.message
      })
    }

    // En actualizaciones, no requerimos archivos obligatorios
    next()
  })
}

// Función para generar URLs relativas de las imágenes con detección de duplicados
const generateImageUrls = (files) => {
  console.log('🔧 Generando URLs de imágenes con detección de duplicados...')
  console.log('📁 Archivos recibidos:', files?.length || 0)

  if (!files || files.length === 0) {
    console.log('⚠️ No hay archivos para procesar')
    return []
  }

  const uploadDir = path.join(__dirname, '../../../front-end/img/nuevos-Producto')
  const urls = []

  files.forEach((file, index) => {
    console.log(`\n📄 Procesando archivo ${index + 1}: ${file.filename}`)

    try {
      // Calcular hash del archivo subido
      const fileHash = calculateFileHash(file.path)
      console.log(`   - Hash calculado: ${fileHash}`)

      // Buscar si ya existe una imagen con el mismo hash
      const duplicateUrl = findDuplicateImage(uploadDir, fileHash, file.originalname)

      if (duplicateUrl) {
        console.log(`♻️ Usando imagen existente: ${duplicateUrl}`)

        // Eliminar el archivo temporal ya que usaremos la imagen existente
        try {
          fs.unlinkSync(file.path)
          console.log(`🗑️ Archivo temporal eliminado: ${file.filename}`)
        } catch (unlinkError) {
          console.error(`❌ Error eliminando archivo temporal: ${unlinkError.message}`)
        }

        urls.push(duplicateUrl)
      } else {
        console.log(`💾 Guardando nueva imagen: ${file.filename}`)
        const url = `nuevos-Producto/${file.filename}`
        urls.push(url)
      }
    } catch (error) {
      console.error(`❌ Error procesando ${file.filename}:`, error.message)
      // En caso de error, usar la imagen subida normalmente
      const url = `nuevos-Producto/${file.filename}`
      urls.push(url)
    }
  })

  console.log('✅ URLs finales generadas:', urls)
  return urls
}

module.exports = {
  handleImageUpload,
  handleOptionalImageUpload,
  generateImageUrls
}
