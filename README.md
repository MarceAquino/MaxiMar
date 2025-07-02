# 🐾 MaxiMar Pet Store

**Sistema de E-commerce para Tienda de Mascotas**

Proyecto integrador de Programación III - UTN Avellaneda  
Desarrollado por: **Marcelo Aquino** y **Maximiliano Arcieri**

---

## 📋 Descripción

MaxiMar Pet Store es un sistema completo de e-commerce diseñado específicamente para tiendas de mascotas. Permite la gestión integral de productos, ventas y administradores a través de una interfaz web moderna y responsiva.

### ✨ Características Principales

- 🛒 **Carrito de Compras**: Sistema completo con persistencia de datos
- 👨‍💼 **Panel de Administración**: Gestión de productos, ventas y usuarios
- 🔐 **Sistema de Autenticación**: JWT para administradores con roles
- 📱 **Responsive Design**: Compatible con dispositivos móviles y desktop
- 🎨 **Modo Oscuro/Claro**: Interfaz adaptable según preferencias
- 📦 **Gestión de Stock**: Control automático de inventario
- 📊 **Reportes de Ventas**: Visualización y análisis de transacciones

---

## 🏗️ Arquitectura del Sistema

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Bootstrap 5** para diseño responsivo
- **Font Awesome** para iconografía
- **Módulos ES6** para organización del código
- **Local/Session Storage** para persistencia local

### Backend
- **Node.js** con **Express.js**
- **MySQL** como base de datos
- **Sequelize ORM** para manejo de datos
- **JWT** para autenticación
- **Bcrypt** para encriptación de contraseñas
- **Multer** para manejo de archivos
- **CORS** habilitado para peticiones cross-origin

---

## 📊 Base de Datos

### Entidades Principales

#### 🗄️ **Administradores (Admin)**
```sql
- admin_id (PK, AUTO_INCREMENT)
- email (UNIQUE, NOT NULL)
- nombre (NOT NULL)
- password (HASHED, NOT NULL)
- rol (admin|superadmin)
- activo (BOOLEAN, DEFAULT true)
```

#### 📦 **Productos (Producto)**
```sql
- producto_id (PK, AUTO_INCREMENT)
- codigo (UNIQUE, NOT NULL)
- nombre (NOT NULL)
- categoria (alimento|juguete)
- tipo_mascota (perro|gato)
- precio (DECIMAL, NOT NULL)
- marca (NOT NULL)
- urls (JSON - Array de imágenes)
- stock (INTEGER, DEFAULT 0)
- atributos_especificos (JSON)
- activo (BOOLEAN, DEFAULT true)
```

#### 🧾 **Ventas (Venta)**
```sql
- venta_id (PK, AUTO_INCREMENT)
- cliente (VARCHAR, DEFAULT 'Cliente Anónimo')
- subtotal (DECIMAL, NOT NULL)
- total (DECIMAL, NOT NULL)
- createdAt (TIMESTAMP)
```

#### 📋 **Detalle de Ventas (DetalleVenta)**
```sql
- detalle_id (PK, AUTO_INCREMENT)
- venta_id (FK → Venta)
- producto_id (FK → Producto)
- cantidad (INTEGER, NOT NULL)
- precio_unitario (DECIMAL, NOT NULL)
- subtotal (DECIMAL, NOT NULL)
```

### 🔗 Relaciones
- Una **Venta** tiene muchos **DetalleVenta**
- Un **Producto** puede estar en muchos **DetalleVenta**
- **DetalleVenta** pertenece a **Venta** y **Producto**

---

## 🚀 Instalación y Configuración

### Pre-requisitos
- **Node.js** (v14 o superior)
- **MySQL** (v8.0 o superior)
- **npm** o **yarn**

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd MaxiMar-Pet-Store
```

### 2. Configuración del Backend

```bash
cd back-end
npm install
```

#### Crear archivo `.env` en `/back-end/`:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=maximar_pet_store
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql

# Servidor
PORT=3030
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h
```

### 3. Configuración del Frontend

```bash
cd ../front-end
npm install
```

### 4. Configuración de Base de Datos

1. **Crear la base de datos MySQL:**
```sql
CREATE DATABASE maximar_pet_store;
```

2. **Las tablas se crean automáticamente** al iniciar el servidor (Sequelize sync)

### 5. Iniciar la Aplicación

#### Servidor Backend:
```bash
cd back-end
npm start
# Servidor ejecutándose en http://localhost:3030
```

#### Servidor Frontend:
```bash
cd front-end
npm start
# Cliente ejecutándose en http://localhost:8080
```

---

## 📡 API Endpoints

### 🔐 Autenticación
| Método | Endpoint | Descripción | Protegido |
|--------|----------|-------------|-----------|
| POST | `/api/auth/login` | Login de administrador | ❌ |
| GET | `/api/auth/verify` | Verificar token JWT | ✅ |
| POST | `/api/auth/logout` | Logout de administrador | ✅ |
| POST | `/api/auth/register` | Registrar admin (solo SuperAdmin) | ✅ |

### 📦 Productos
| Método | Endpoint | Descripción | Protegido |
|--------|----------|-------------|-----------|
| GET | `/api/products` | Listar todos los productos | ❌ |
| GET | `/api/products/:id` | Obtener producto por ID | ❌ |
| POST | `/api/products` | Crear nuevo producto | ✅ |
| PUT | `/api/products/:id` | Actualizar producto | ✅ |
| DELETE | `/api/products/:id` | Eliminar producto (SuperAdmin) | ✅ |
| PATCH | `/api/products/:id/activate` | Activar producto (SuperAdmin) | ✅ |
| PATCH | `/api/products/:id/deactivate` | Desactivar producto (SuperAdmin) | ✅ |

### 🛒 Ventas
| Método | Endpoint | Descripción | Protegido |
|--------|----------|-------------|-----------|
| POST | `/api/sales` | Crear nueva venta | ❌ |
| GET | `/api/sales/:id` | Obtener venta por ID | ❌ |
| GET | `/api/sales` | Listar todas las ventas (SuperAdmin) | ✅ |

### 👥 Administradores
| Método | Endpoint | Descripción | Protegido |
|--------|----------|-------------|-----------|
| GET | `/api/admin/list` | Listar administradores (SuperAdmin) | ✅ |
| PATCH | `/api/admin/:id/toggle` | Activar/desactivar admin (SuperAdmin) | ✅ |

---

## 👤 Sistema de Roles

### 🔑 **SuperAdmin**
- ✅ Gestión completa de productos (CRUD)
- ✅ Activar/desactivar productos
- ✅ Registrar nuevos administradores
- ✅ Gestionar estado de administradores
- ✅ Ver todas las ventas y reportes
- ✅ Eliminar productos permanentemente

### 👨‍💼 **Admin**
- ✅ Crear y editar productos
- ❌ No puede activar/desactivar productos
- ❌ No puede registrar administradores
- ❌ No puede ver ventas
- ❌ No puede eliminar productos

### 🛒 **Cliente (Sin autenticación)**
- ✅ Ver catálogo de productos
- ✅ Agregar productos al carrito
- ✅ Realizar compras
- ✅ Ver detalles de productos

---

## 🗂️ Estructura del Proyecto

```
MaxiMar-Pet-Store/
│
├── 📁 back-end/                    # Servidor Node.js
│   ├── 📄 server.js               # Punto de entrada del servidor
│   ├── 📄 package.json            # Dependencias del backend
│   ├── 📁 src/
│   │   ├── 📁 config/             # Configuración (DB, constantes)
│   │   ├── 📁 controllers/        # Lógica de negocio
│   │   │   ├── 📁 adminController/
│   │   │   ├── 📁 customerController/
│   │   │   ├── 📁 productoController/
│   │   │   └── 📁 ventaController/
│   │   ├── 📁 middlewares/        # Middlewares (auth, upload, etc.)
│   │   ├── 📁 models/             # Modelos Sequelize
│   │   ├── 📁 routers/            # Rutas de la API
│   │   └── 📁 utils/              # Funciones auxiliares
│   └── 📁 Diagrama entidad relacion/
│
├── 📁 front-end/                   # Cliente web
│   ├── 📄 index.html              # Página principal
│   ├── 📄 package.json            # Dependencias del frontend
│   ├── 📁 css/                    # Estilos CSS
│   ├── 📁 html/                   # Páginas HTML
│   │   ├── 📁 admin/              # Panel de administración
│   │   └── 📁 customer/           # Páginas de cliente
│   ├── 📁 img/                    # Imágenes y recursos
│   └── 📁 js/                     # JavaScript modular
│       ├── 📁 admin/              # Scripts del panel admin
│       ├── 📁 customer/           # Scripts del cliente
│       ├── 📁 config/             # Configuración de API
│       └── 📁 utils/              # Utilidades compartidas
│
└── 📄 README.md                   # Documentación del proyecto
```

---

## 🎯 Funcionalidades Detalladas

### 🛒 Para Clientes

#### **Catálogo de Productos**
- Visualización de productos con imágenes, precios y detalles
- Filtros por categoría (alimento/juguete) y tipo de mascota (perro/gato)
- Sistema de búsqueda por nombre o código
- Paginación y ordenamiento de resultados

#### **Carrito de Compras**
- Agregar/quitar productos con validación de stock
- Persistencia en `sessionStorage`
- Cálculo automático de totales
- Validación de disponibilidad antes de compra

#### **Proceso de Compra**
- Checkout sencillo con datos mínimos del cliente
- Generación automática de número de orden
- Descuento automático de stock
- Ticket de compra descargable/imprimible

### 👨‍💼 Para Administradores

#### **Gestión de Productos**
- CRUD completo de productos
- Subida múltiple de imágenes (hasta 5 por producto)
- Validación de datos y códigos únicos
- Control de stock y estado (activo/inactivo)
- Atributos específicos por tipo de producto

#### **Dashboard Intuitivo**
- Vista general con métricas importantes
- Filtros avanzados y búsqueda
- Interfaz responsiva y moderna
- Notificaciones en tiempo real

#### **Sistema de Reportes** (Solo SuperAdmin)
- Historial completo de ventas
- Detalles expandibles de cada transacción
- Estadísticas de productos más vendidos
- Filtros por fecha y cliente

---

## 🔧 Tecnologías y Dependencias

### Backend
```json
{
  "express": "^4.21.2",
  "sequelize": "^6.37.7",
  "mysql2": "^3.14.1",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^6.0.0",
  "cors": "^2.8.5",
  "multer": "^2.0.1",
  "dotenv": "^16.5.0",
  "accesscontrol": "^2.2.1"
}
```

### Frontend
```json
{
  "live-server": "^1.2.2",
  "standard": "^17.1.2"
}
```

### CDN Externas
- **Bootstrap 5.3.6**: Framework CSS
- **Font Awesome 6.0.0**: Iconografía
- **Google Fonts**: Tipografías personalizadas

---

## 🔒 Seguridad Implementada

### 🛡️ **Autenticación y Autorización**
- **JWT (JSON Web Tokens)** para sesiones seguras
- **Bcrypt** para hash de contraseñas (salt rounds: 12)
- **Middleware de autenticación** en rutas protegidas
- **Control de roles** (SuperAdmin/Admin)
- **Expiración automática** de tokens (24h)

### 🔐 **Validaciones**
- **Sanitización de inputs** en frontend y backend
- **Validación de tipos de datos** con Sequelize
- **Constraints de base de datos** (UNIQUE, NOT NULL)
- **Validación de stock** antes de ventas
- **Validación de permisos** por rol

### 🚪 **Gestión de Sesiones**
- **sessionStorage** para tokens (se borra al cerrar navegador)
- **Limpieza automática** de datos al cerrar sesión
- **Eventos beforeunload** para limpieza en cierre forzoso
- **Verificación continua** de tokens válidos

---

## 📱 Responsive Design

### 🖥️ **Desktop (1200px+)**
- Dashboard completo con sidebar fijo
- Múltiples columnas para productos
- Tablas expandibles para datos detallados
- Formularios en modal o páginas dedicadas

### 📱 **Tablet (768px - 1199px)**
- Sidebar colapsable
- Grilla adaptativa de productos
- Navegación optimizada por touch
- Cards redimensionables

### 📱 **Mobile (320px - 767px)**
- Menú hamburguesa
- Una columna para productos
- Botones más grandes para touch
- Interfaz simplificada y enfocada

---

## 🧪 Testing y Calidad de Código

### 📏 **Estándares de Código**
- **ESLint Standard** para JavaScript
- **Convenciones de nomenclatura** consistentes
- **Comentarios JSDoc** en funciones principales
- **Modularización** clara y separación de responsabilidades

### 🔍 **Validaciones del Sistema**
- **Validación de formularios** en tiempo real
- **Manejo de errores** con try-catch
- **Logging** detallado en consola
- **Feedback visual** para usuarios

---

## 🚀 Deployment y Producción

### 🌐 **Configuración para Producción**

1. **Variables de Entorno:**
```env
NODE_ENV=production
DB_HOST=tu_servidor_produccion
JWT_SECRET=clave_super_segura_de_produccion
```

2. **Optimizaciones Recomendadas:**
- Minificación de CSS y JavaScript
- Compresión de imágenes
- Configuración de HTTPS
- CDN para assets estáticos
- Cache de base de datos
- Rate limiting en API

3. **Monitoreo:**
- Logs estructurados
- Métricas de performance
- Monitoreo de errores
- Backups automáticos de BD

---

## 📚 Casos de Uso Principales

### 🛒 **Flujo de Compra del Cliente**
1. Cliente navega por el catálogo
2. Filtra productos por categoría/mascota
3. Agrega productos al carrito
4. Revisa el carrito y ajusta cantidades
5. Procede al checkout
6. Confirma la compra
7. Recibe número de orden y ticket

### 👨‍💼 **Gestión de Productos (Admin)**
1. Admin inicia sesión en el panel
2. Navega a gestión de productos
3. Crea/edita producto con imágenes
4. Configura precio, stock y atributos
5. Activa/desactiva productos según disponibilidad
6. Monitorea ventas y stock

### 🔧 **Administración del Sistema (SuperAdmin)**
1. SuperAdmin accede al panel completo
2. Registra nuevos administradores
3. Gestiona permisos y estados de admins
4. Revisa reportes de ventas completos
5. Administra productos con permisos totales
6. Configura parámetros del sistema

---

## 🐛 Solución de Problemas Comunes

### ❌ **Error de Conexión a Base de Datos**
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar credenciales en .env
DB_USER=usuario_correcto
DB_PASSWORD=contraseña_correcta
```

### ❌ **Problemas con JWT**
```bash
# Verificar que JWT_SECRET esté configurado
JWT_SECRET=clave_secreta_de_al_menos_32_caracteres
```

### ❌ **Imágenes no se Cargan**
```bash
# Verificar permisos de carpeta uploads
chmod 755 back-end/uploads/
```

### ❌ **CORS Errors**
```javascript
// En server.js, verificar configuración CORS
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
```

---

## 🤝 Contribución

### 📋 **Guías para Contribuir**
1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### 📝 **Convenciones de Código**
- **Nombres en español** para variables y funciones
- **Comentarios descriptivos** en funciones principales
- **Console.log con emojis** para mejor debugging
- **Manejo de errores** siempre con try-catch

---

## 👥 Equipo de Desarrollo

### 👨‍💻 **Marcelo Aquino**
- Backend Development
- Database Design
- API Architecture

### 👨‍💻 **Maximiliano Arcieri**
- Frontend Development
- UI/UX Design
- Testing & QA

---

## 📄 Licencia

Este proyecto es desarrollado como trabajo académico para la UTN Avellaneda.  
**Programación III** - Proyecto Integrador

---

## 📞 Soporte

Para preguntas o soporte técnico:
- 📧 Email: [contacto@maximar-petstore.com](mailto:contacto@maximar-petstore.com)
- 🐛 Issues: [GitHub Issues](link-a-issues)
- 📖 Documentación: [Wiki del Proyecto](link-a-wiki)

---

**Última actualización:** Julio 2025  
**Versión del Sistema:** 1.0.0  
**Estado:** ✅ Estable para Producción
