// Modelo Producto para la tabla 'producto'.
// Representa los productos disponibles en la tienda de mascotas.
// Campos:
// - producto_id: Identificador único, autoincremental y clave primaria.
// - codigo: Código único del producto (obligatorio, 3-20 caracteres).
// - nombre: Nombre del producto (obligatorio, 3-100 caracteres).
// - categoria: Categoría del producto ('alimento' o 'juguete').
// - tipo_mascota: Especie a la que va dirigido ('perro' o 'gato').
// - precio: Precio unitario (mínimo 0.01, obligatorio).
// - marca: Marca del producto (obligatorio, 2-50 caracteres).
// - urls: Arreglo JSON con URLs de imágenes del producto.
// - stock: Unidades disponibles (por defecto 0, mínimo 0).
// - atributos_especificos: JSON con atributos adicionales según el tipo de producto.
// - activo: Estado de activación del producto (por defecto true).

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
      allowNull: false
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
