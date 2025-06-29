require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { sequelize } = require('./src/models')
const { PORT } = require('./src/config/constantes')
const postRoutes = require('./src/routers/routes')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Servir archivos estáticos del frontend
app.use('/front-end', express.static('../front-end'))

// Rutas
app.use('/api', postRoutes)

// Conexión base de datos y sincronización de modelos
const conectarDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Conectado a la base de datos correctamente.')
    await sequelize.sync({ force: false }) // Sincronizar sin recrear tablas
    console.log('📦 Tablas sincronizadas correctamente.')
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message)
  }
}

// Iniciar servidor
app.listen(PORT, async () => {
  await conectarDB()
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
