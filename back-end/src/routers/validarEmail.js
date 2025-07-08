const express = require('express')
const router = express.Router()
const { Admin } = require('../models')

// GET /api/validar-email?email=...
router.get('/', async (req, res) => {
  const { email } = req.query
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' })
  }
  try {
    const existe = await Admin.findOne({ where: { email } })
    res.json({ exists: !!existe })
  } catch (error) {
    res.status(500).json({ error: 'Error de servidor' })
  }
})

module.exports = router
