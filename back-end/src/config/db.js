// Carga las variables de entorno y constantes de configuración
require('dotenv').config()
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = require('./constantes.js')
const { Sequelize } = require('sequelize')

/**
 * Configuración y creación de la instancia Sequelize para la conexión a la base de datos MySQL.
 *
 * Parámetros:
 *  - DB_NAME: Nombre de la base de datos
 *  - DB_USER: Usuario de la base de datos
 *  - DB_PASSWORD: Contraseña del usuario
 *  - DB_HOST: Host donde se encuentra la base de datos
 *  - DB_PORT: Puerto de conexión
 *
 * Opciones:
 *  - dialect: Motor de base de datos (mysql)
 *  - logging: Desactiva logs de SQL en consola
 *  - timezone: Zona horaria para registros
 */
const db = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '-03:00'
  }
)

// Exporta la instancia de Sequelize para usar en los modelos
module.exports = db
