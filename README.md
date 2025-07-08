# MaxiMar Pet Store

## Seeder de Superadmin

Para crear un usuario superadmin inicial en la base de datos, ejecuta el siguiente script:

```
node back-end/seeder/superadminSeeder.js
```

- El script crea un usuario con:
  - **Email:** superadmin@maximar.com
  - **Contraseña:** SuperAdmin123!
  - **Nombre:** Super Admin
  - **Rol:** superadmin
- Si ya existe un usuario con ese email, no se creará otro.
- Puedes modificar el email y la contraseña en el archivo antes de ejecutarlo.

> Ejecuta este script solo una vez para inicializar el superadmin.

---

(Agrega aquí el resto de la documentación de tu proyecto)
