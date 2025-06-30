// Router principal de MaxiMar Pet Store
// Une y expone los routers modularizados de productos, auth y ventas

const express = require('express')
const router = express.Router()

// Modularización de rutas
router.use(require('./products')) // Rutas de productos
router.use(require('./auth')) // Rutas de autenticación y admins
router.use(require('./sales')) // Rutas de ventas

module.exports = router
