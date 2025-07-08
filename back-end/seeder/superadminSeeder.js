// Seeder para crear un superadmin si no existe
// Ejecutar este archivo una sola vez para crear el usuario superadmin inicial

const { Admin } = require('../src/models')
const bcrypt = require('bcryptjs')

async function crearSuperadmin () {
  const email = 'superadmin@maximar.com' // Cambia si lo deseas
  const password = 'SuperAdmin123!' // Cambia si lo deseas
  const nombre = 'Super Admin'

  // Buscar si ya existe un superadmin con ese email
  const existente = await Admin.findOne({ where: { email } })
  if (existente) {
    console.log('Ya existe un superadmin con ese email.')
    return
  }

  // Crear el superadmin
  const hash = await bcrypt.hash(password, 10)
  await Admin.create({
    nombre,
    email,
    password: hash,
    rol: 'superadmin'
  })
  console.log('Superadmin creado correctamente.')
}

// Ejecutar la función
crearSuperadmin()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1) })
