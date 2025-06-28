const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const Admin = require('./admin')(sequelize, DataTypes)
const Producto = require('./producto')(sequelize, DataTypes)
const Venta = require('./venta')(sequelize, DataTypes)
const DetalleVenta = require('./detalle_venta')(sequelize, DataTypes)

// Relaciones
Venta.hasMany(DetalleVenta, {
  foreignKey: 'venta_id',
  as: 'DetalleVentas'
})
DetalleVenta.belongsTo(Venta, {
  foreignKey: 'venta_id',
  as: 'Venta'
})

Producto.hasMany(DetalleVenta, {
  foreignKey: 'producto_id',
  as: 'DetalleVentas'
})
DetalleVenta.belongsTo(Producto, {
  foreignKey: 'producto_id',
  as: 'Producto'
})

module.exports = {
  sequelize,
  Admin,
  Producto,
  Venta,
  DetalleVenta
}
