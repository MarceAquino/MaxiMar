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
    tableName: 'venta',
    timestamps: true
  })

  return Venta
}
