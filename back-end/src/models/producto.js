module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    producto_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20]
      }
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100]
      }
    },
    categoria: {
      type: DataTypes.ENUM('alimento', 'juguete'),
      allowNull: false
    },
    tipo_mascota: {
      type: DataTypes.ENUM('perro', 'gato'),
      allowNull: false
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    marca: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    urls: {
      type: DataTypes.JSON,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    atributos_especificos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'producto'
  })

  return Producto
}
