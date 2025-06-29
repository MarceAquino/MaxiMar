// Inicialización y asociación de modelos Sequelize para la base de datos.
// Este archivo centraliza la importación de modelos y define las relaciones entre ellos.
// Modelos:
// - Admin: Administradores del sistema.
// - Producto: Productos disponibles en la tienda.
// - Venta: Ventas realizadas por los clientes.
// - DetalleVenta: Detalle de cada producto vendido en una venta.
//
// Relaciones:
// - Una Venta tiene muchos DetalleVenta (una venta puede tener varios productos).
// - Un Producto tiene muchos DetalleVenta (un producto puede estar en varias ventas).
// - DetalleVenta pertenece tanto a Venta como a Producto.

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
