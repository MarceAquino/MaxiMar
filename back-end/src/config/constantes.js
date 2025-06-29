// Carga las variables de entorno desde el archivo .env
require('dotenv').config()

/**
 * Exporta las constantes de configuración del entorno.
 * Estas variables se utilizan para la conexión a la base de datos,
 * configuración del servidor y autenticación JWT.
 * Asegúrate de definirlas en el archivo .env en la raíz del back-end.
 *
 * DB_HOST: Host de la base de datos
 * DB_PORT: Puerto de la base de datos
 * DB_NAME: Nombre de la base de datos
 * DB_USER: Usuario de la base de datos
 * DB_PASSWORD: Contraseña de la base de datos
 * PORT: Puerto en el que corre el servidor Express
 * NODE_ENV: Entorno de ejecución (development, production, etc)
 * JWT_SECRET: Clave secreta para firmar los tokens JWT
 * JWT_EXPIRATION: Tiempo de expiración de los tokens JWT
 */
module.exports = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRES_IN
}
