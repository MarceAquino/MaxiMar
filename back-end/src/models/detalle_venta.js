// Modelo DetalleVenta para la tabla 'detalle_venta'.
// Representa el detalle de cada producto vendido en una venta.
// Campos:
// - detalle_id: Identificador único del detalle, autoincremental y clave primaria.
// - venta_id: Referencia a la venta principal (obligatorio).
// - producto_id: Referencia al producto vendido (obligatorio).
// - cantidad: Cantidad de unidades vendidas (mínimo 1, obligatorio).
// - precio_unitario: Precio de cada unidad del producto (mínimo 0.01, obligatorio).
// - subtotal: Total por este producto (cantidad * precio_unitario, mínimo 0, obligatorio).

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
