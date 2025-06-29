// Modelo Venta para la tabla 'venta'.
// Representa una venta realizada en la tienda.
// Campos:
// - venta_id: Identificador único de la venta, autoincremental y clave primaria.
// - cliente: Nombre del cliente (opcional, hasta 30 caracteres).
// - subtotal: Suma de los subtotales de los productos vendidos (mínimo 0, obligatorio).
// - total: Total de la venta (mínimo 0, obligatorio).

module.exports = (sequelize, DataTypes) => {
  const Venta = sequelize.define('Venta', {
    venta_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    cliente: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'venta'
  })

  return Venta
}
