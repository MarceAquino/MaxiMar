require('dotenv').config()
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = require('./constantes.js')
const { Sequelize } = require('sequelize')

const db = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false // opcional para no ver tantas consultas en consola
  }
)

module.exports = db
