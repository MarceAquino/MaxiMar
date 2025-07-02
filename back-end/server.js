// Servidor principal de MaxiMar Pet Store (backend)
// - Expone la API REST bajo /api
// - Sirve archivos estáticos del frontend
// - Conecta y sincroniza la base de datos Sequelize
// - Usa middlewares para CORS y JSON

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { sequelize } = require('./src/models')
const { PORT } = require('./src/config/constantes')
const apiRoutes = require('./src/routers/index')

const app = express()

// Middlewares
app.use(cors()) // Permite peticiones cross-origin
app.use(express.json()) // Permite recibir JSON en las peticiones

// Servir archivos estáticos del frontend
app.use('/front-end', express.static('../front-end'))

// Rutas principales de la API
app.use('/api', apiRoutes)

// Conexión base de datos y sincronización de modelos
const conectarDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('- Conectado a la base de datos correctamente.')
    await sequelize.sync({ force: false }) // Sincronizar sin recrear tablas
    console.log('- Tablas sincronizadas correctamente.')
  } catch (error) {
    console.error('!! Error al conectar con la base de datos:', error.message)
  }
}

// Iniciar servidor
app.listen(PORT, async () => {
  await conectarDB()
  console.log(`- Servidor corriendo en http://localhost:${PORT}`)
})
