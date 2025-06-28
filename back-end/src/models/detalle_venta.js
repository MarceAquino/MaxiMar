module.exports = (sequelize, DataTypes) => {
  const DetalleVenta = sequelize.define('DetalleVenta', {
    detalle_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    venta_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'detalle_venta'
  })

  return DetalleVenta
}
