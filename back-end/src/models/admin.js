// Definición del modelo Admin para la tabla 'admin'.
// Este modelo representa a los administradores del sistema, incluyendo superadministradores y administradores comunes.
// Campos:
// - admin_id: Identificador único, autoincremental y clave primaria.
// - email: Correo electrónico único y obligatorio, validado como email.
// - nombre: Nombre del administrador, obligatorio, entre 2 y 100 caracteres.
// - password: Contraseña encriptada, obligatoria, entre 6 y 255 caracteres.
// - rol: Rol del administrador ('superadmin' o 'admin'), por defecto 'admin'.
// - activo: Estado de activación del usuario, por defecto true.

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    admin_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    rol: {
      type: DataTypes.ENUM('superadmin', 'admin'),
      allowNull: false,
      defaultValue: 'admin'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'admin'
  })

  return Admin
}
