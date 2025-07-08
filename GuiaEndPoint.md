# Documentación de Endpoints - MaxiMar Pet Store

## Introducción

Este documento presenta la documentación completa de la API REST desarrollada para MaxiMar Pet Store. La API maneja tres módulos principales: autenticación de administradores, gestión de productos y procesamiento de ventas.

## Configuración Base

**URL del servidor:** http://localhost:3000/api

**Formato de respuestas:** Todas las respuestas siguen un formato estándar JSON que incluye un indicador de éxito, mensaje descriptivo y datos cuando corresponde.

**Herramientas recomendadas:** Postman, Thunder Client, Insomnia, cURL o cualquier cliente REST

Respuesta exitosa:

```json
{
  "ok": true,
  "mensaje": "Operación completada exitosamente",
  "data": { ... }
}
```

Respuesta con error:

```json
{
  "ok": false,
  "error": "Descripción del error",
  "details": "Información adicional del error"
}
```

---

## Módulo de Autenticación

### Endpoint 1: Iniciar Sesión de Administrador

**Ruta:** POST /auth/login
**Propósito:** Permite el acceso de administradores al sistema
**Autenticación requerida:** No

**Configuración de la petición:**

```
Método: POST
URL: http://localhost:3000/api/auth/login
Headers:
  Content-Type: application/json

Cuerpo de la petición (JSON):
{
  "email": "superadmin@maximar.com",
  "password": "SuperAdmin123!"
}
```

**Respuesta esperada:**

```json
{
  "ok": true,
  "mensaje": "Login exitoso",
  "admin": {
    "admin_id": 1,
    "nombre": "Super Administrador",
    "email": "superadmin@maximar.com",
    "rol": "superadmin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Nota importante:** El token devuelto debe guardarse para usar en endpoints protegidos.

### Endpoint 2: Verificar Token de Sesión

**Ruta:** GET /auth/verify
**Propósito:** Valida que el token de sesión sea válido y esté activo
**Autenticación requerida:** Sí (token válido)

**Configuración de la petición:**

```
Método: GET
URL: http://localhost:3000/api/auth/verify
Headers:
  Authorization: Bearer [TOKEN_OBTENIDO_EN_LOGIN]
```

### Endpoint 3: Registrar Nuevo Administrador

**Ruta:** POST /auth/register
**Propósito:** Crear una nueva cuenta de administrador en el sistema
**Autenticación requerida:** Sí (token de superadmin)

**Configuración de la petición:**

```
Método: POST
URL: http://localhost:3000/api/auth/register
Headers:
  Authorization: Bearer [TOKEN_SUPERADMIN]
  Content-Type: application/json

Cuerpo de la petición (JSON):
{
  "nombre": "Juan Pérez",
  "email": "juan@maximarpet.com",
  "password": "123456",
  "confirmPassword": "123456",
  "rol": "admin"
}
```

### Endpoint 4: Listar Administradores

**Ruta:** GET /admin/list
**Propósito:** Obtener lista completa de administradores registrados
**Autenticación requerida:** Sí (token de superadmin)

**Configuración de la petición:**

```
Método: GET
URL: http://localhost:3000/api/admin/list
Headers:
  Authorization: Bearer [TOKEN_SUPERADMIN]
```

### Endpoint 5: Cambiar Estado de Administrador

**Ruta:** PATCH /admin/:id/toggle
**Propósito:** Activar o desactivar cuenta de administrador
**Autenticación requerida:** Sí (token de superadmin)

**Configuración de la petición:**

```
Método: PATCH
URL: http://localhost:3000/api/admin/2/toggle
Headers:
  Authorization: Bearer [TOKEN_SUPERADMIN]
```

---

## Módulo de Productos

### Endpoint 6: Listar Productos Disponibles

**Ruta:** GET /products
**Propósito:** Obtener catálogo de productos activos para clientes
**Autenticación requerida:** No

**Configuración de la petición:**

```
Método: GET
URL: http://localhost:3000/api/products
```

### Endpoint 7: Obtener Producto Específico

**Ruta:** GET /products/:id
**Propósito:** Consultar detalles de un producto particular
**Autenticación requerida:** No

**Configuración de la petición:**

```
Método: GET
URL: http://localhost:3000/api/products/1
```

### Endpoint 8: Crear Nuevo Producto

**Ruta:** POST /products
**Propósito:** Agregar producto al catálogo con imágenes
**Autenticación requerida:** Sí (token de admin o superadmin)

**Configuración de la petición:**

```
Método: POST
URL: http://localhost:3000/api/products
Headers:
  Authorization: Bearer [TOKEN_ADMIN]

Cuerpo de la petición (Form Data):
  nombre: Pelota para Perro Grande
  marca: Kong
  precio: 25.50
  stock: 10
  categoria: juguete
  tipo_mascota: perro
  descripcion: Pelota resistente para perros grandes
  atributos_especificos: {"tamano":"grande","material":"caucho"}
  imagenes: [Seleccionar archivos de imagen]
```

**Consideración técnica:** Este endpoint utiliza Form Data debido a la necesidad de enviar archivos de imagen junto con los datos del producto.

### Endpoint 9: Actualizar Producto Existente

**Ruta:** PUT /products/:id
**Propósito:** Modificar información de producto sin cambiar imágenes
**Autenticación requerida:** Sí (token de admin o superadmin)

**Configuración de la petición:**

```
Método: PUT
URL: http://localhost:3000/api/products/1
Headers:
  Authorization: Bearer [TOKEN_ADMIN]
  Content-Type: application/json

Cuerpo de la petición (JSON):
{
  "nombre": "Pelota para Perro Grande - Actualizada",
  "marca": "Kong",
  "precio": 27.50,
  "stock": 15,
  "categoria": "juguete",
  "tipo_mascota": "perro",
  "descripcion": "Pelota resistente para perros grandes - Nueva versión",
  "atributos_especificos": {
    "tamano": "grande",
    "material": "caucho reforzado"
  }
}
```

**Consideración técnica:** A diferencia del endpoint de creación, este utiliza JSON ya que no maneja archivos de imagen.

### Endpoint 10: Eliminar Producto

**Ruta:** DELETE /products/:id
**Propósito:** Remover producto permanentemente de la base de datos
**Autenticación requerida:** Sí (token de superadmin)

**Configuración de la petición:**

```
Método: DELETE
URL: http://localhost:3000/api/products/1
Headers:
  Authorization: Bearer [TOKEN_SUPERADMIN]
```

### Endpoint 11: Activar Producto

**Ruta:** PATCH /products/:id/activate
**Propósito:** Hacer producto disponible para venta
**Autenticación requerida:** Sí (token de superadmin)

**Configuración de la petición:**

```
Método: PATCH
URL: http://localhost:3000/api/products/1/activate
Headers:
  Authorization: Bearer [TOKEN_SUPERADMIN]
```

**Validación:** El producto debe tener stock mayor a 0 para poder activarse.

### Endpoint 12: Desactivar Producto

**Ruta:** PATCH /products/:id/deactivate
**Propósito:** Remover producto de venta sin eliminarlo
**Autenticación requerida:** Sí (token de superadmin)

**Configuración de la petición:**

```
Método: PATCH
URL: http://localhost:3000/api/products/1/deactivate
Headers:
  Authorization: Bearer [TOKEN_SUPERADMIN]
```

---

## Módulo de Ventas

### Endpoint 13: Crear Nueva Venta

**Ruta:** POST /sales
**Propósito:** Procesar compra de cliente con múltiples productos
**Autenticación requerida:** No

**Configuración de la petición:**

```
Método: POST
URL: http://localhost:3000/api/sales
Headers:
  Content-Type: application/json

Cuerpo de la petición (JSON):
{
  "cliente": {
    "nombre": "María González",
    "email": "maria@gmail.com",
    "telefono": "555-0123"
  },
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 3,
      "cantidad": 1
    }
  ]
}
```

### Endpoint 14: Consultar Venta Específica

**Ruta:** GET /sales/:id
**Propósito:** Obtener detalles completos de una venta realizada
**Autenticación requerida:** No

**Configuración de la petición:**

```
Método: GET
URL: http://localhost:3000/api/sales/1
```

### Endpoint 15: Reporte de Todas las Ventas

**Ruta:** GET /sales
**Propósito:** Generar reporte completo de ventas para administración
**Autenticación requerida:** Sí (token de superadmin)

**Configuración de la petición:**

```
Método: GET
URL: http://localhost:3000/api/sales
Headers:
  Authorization: Bearer [TOKEN_SUPERADMIN]
```

---

## Flujos de Trabajo Recomendados

### Flujo 1: Autenticación de Administrador

1. Ejecutar POST /auth/login con credenciales válidas
2. Extraer y guardar el token de la respuesta
3. Incluir token en header Authorization de endpoints protegidos

### Flujo 2: Gestión Completa de Producto

1. Consultar productos existentes con GET /products
2. Crear nuevo producto con POST /products (usando Form Data)
3. Verificar creación consultando lista actualizada
4. Modificar producto con PUT /products/:id (usando JSON)
5. Cambiar estado con PATCH /products/:id/activate o /deactivate

### Flujo 3: Procesamiento de Venta

1. Consultar productos disponibles con GET /products
2. Crear venta con POST /sales incluyendo datos de cliente y productos
3. Verificar venta creada con GET /sales/:id
4. Generar reporte administrativo con GET /sales (como superadmin)

---

## Códigos de Estado HTTP

| Código | Descripción                | Acción Recomendada          |
| ------ | -------------------------- | --------------------------- |
| 200    | Operación exitosa          | Continuar con flujo normal  |
| 401    | Token inválido o expirado  | Renovar autenticación       |
| 403    | Permisos insuficientes     | Verificar rol de usuario    |
| 404    | Recurso no encontrado      | Confirmar ID del recurso    |
| 422    | Datos de entrada inválidos | Revisar formato de petición |
| 500    | Error interno del servidor | Revisar logs del servidor   |

---

## Consideraciones Técnicas Importantes

### Gestión de Tokens

Los tokens JWT tienen tiempo de expiración limitado. En caso de recibir error 401, es necesario realizar nuevo login para obtener token actualizado.

### Diferencias en Formato de Datos

- **Crear producto:** Utiliza Form Data debido a la inclusión de archivos de imagen
- **Actualizar producto:** Utiliza JSON ya que solo maneja datos textuales y numéricos
- **Todas las demás operaciones:** Utilizan JSON para intercambio de datos

### Niveles de Autorización

- **Admin:** Puede crear, modificar y consultar productos
- **Superadmin:** Tiene todas las capacidades de admin más eliminación de productos y gestión de administradores

### Validaciones del Sistema

- Los productos requieren stock mayor a 0 para activarse
- Las ventas validan disponibilidad de stock antes de procesarse
- Los emails de administradores deben ser únicos en el sistema

---

## Ejemplos de Pruebas Completas

### Prueba de Gestión de Productos

1. Autenticarse como administrador
2. Crear producto con imágenes usando Form Data
3. Verificar aparición en listado público
4. Actualizar información del producto
5. Cambiar a superadmin y desactivar producto
6. Eliminar producto definitivamente

### Prueba de Flujo de Venta

1. Consultar catálogo de productos disponibles
2. Crear venta con productos válidos y datos de cliente
3. Verificar detalles de venta generada
4. Acceder como superadmin y consultar reporte de ventas

Esta documentación proporciona una guía completa para interactuar con todos los endpoints de la API MaxiMar Pet Store de manera estructurada y profesional.
