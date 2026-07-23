# Sistema de gestión de inventario
![Status](https://img.shields.io/badge/Estado-En%20desarrollo-yellow)

Sistema de gestión de inventario, pensado para funcionar de forma local y para un usuario.

## Tecnologías

| Herramienta  | Rol |
| ------------- | ------------- |
| React + Vite + TypeScript  | Interfaz de usuario  |
| Tailwind CSS + shadcn/ui  | Estilos y componentes  |
| Node.js + Express + TypeScript | Servidor y API REST |
| SQLite + better-sqlite3 | Base de datos local |

## Características del proyecto

- Gestión de productos (CRUD)
- Gestión de características (CRUD)
- Clasificación de productos
- Subida de imágenes
- Vista previa de imágenes
- Búsqueda de productos
- Filtrado por categoría

## Requisitos previos

- Node.js 20 o superior

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd inventario

# 2. Instalar dependencias en la raíz del proyecto
npm install

# 3. Instalar dependencias del servidor
cd server
npm install

# 4. Instalar dependencias del cliente
cd ../client
npm install

# 5. Volver a la raíz y correr el proyecto
cd ..
npm run dev
```

El servidor quedará en `http://localhost:3000` y el cliente en `http://localhost:5173`.

## Estructura del proyecto
Se decidió separar el proyecto en dos aplicaciones independientes, en una arquitectura monorepo:
```
inventario/
├── client/                     # Frontend
│   └── src/
│       ├── components/         # Componentes reutilizables
│       ├── pages/              # Páginas
│       ├── services/           # Llamadas a la API
│       ├── types/              # Tipos TypeScript
│       ├── App.tsx             # Componente raíz, orquesta qué página se muestra
│       ├── main.tsx            # Punto de entrada de React  
│       └── index.css           # Estilos globales (importa Tailwind)
├── server/                     # Backend
│   └── src/
│       ├── categories/         # Módulo de categorías
│       │   ├── categories.repository.ts
│       │   ├── categories.service.ts
│       │   ├── categories.controller.ts
│       │   └── categories.router.ts
│       ├── products/           # Módulo de productos
│       │   ├── products.repository.ts
│       │   ├── products.service.ts
│       │   ├── products.controller.ts
│       │   └── products.router.ts
│       ├── db/
│       │   ├── database.ts     # Conexión SQLite
│       │   ├── schema.ts       # Definición de tablas
│       │   └── init.ts         # Inicialización de base de datos
│       ├── errors/
│       │   └── AppError.ts     # Clase de error personalizada
│       ├── middlewares/
│       │   ├── errorHandler.ts # Manejador global de errores
│       │   └── upload.ts       # Configuración de multer para imágenes
│       └── index.ts            # Punto de entrada del servidor
├── uploads/                    # Imágenes subidas
└── inventario.db               # Base de datos SQLite
```
## Organización del proyecto
 
En la raíz existe un `package.json`, que tiene, como única función, facilitar la administración del proyecto a través de scripts globales; en este caso existe un script para correr el frontend y el cliente en la misma consola, con un único comando en la raíz (`npm run dev`). Esto no reemplaza ni afecta los `package.json` de `client` y `server`, cada uno administra sus dependencias y configuraciones de forma independiente.
 
## Arquitectura del backend
 
El backend sigue una arquitectura por capas:
 
```
Cliente
    │
    ▼
Ruta               → define los endpoints
    │
    ▼
Controlador        → maneja las peticiones HTTP
    │
    ▼
Servicio           → lógica de negocio y validaciones
    │
    ▼
Repositorio        → interactúa con la base de datos
    │
    ▼
Base de datos
```
 
Esta arquitectura facilita:
- Mantenimiento y legibilidad del código
- Incorporación de nuevas funcionalidades
- Posible migración futura a otro motor de base de datos

## API REST

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categories` | Listar todas las categorías |
| GET | `/api/categories/:id` | Obtener una categoría por id |
| POST | `/api/categories` | Crear una categoría |
| PUT | `/api/categories/:id` | Actualizar una categoría |
| DELETE | `/api/categories/:id` | Eliminar una categoría |
| DELETE | `/api/categories/:id?deleteProducts=true` | Eliminar categoría y sus productos |

#### Ejemplo de body (crear/actualizar):
```json
{
  "name": "Electrónica",
  "description": "Productos electrónicos"
}
```

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Listar productos |
| GET | `/api/products?search=laptop` | Buscar por nombre |
| GET | `/api/products?categoryId=1` | Filtrar por categoría |
| GET | `/api/products/:id` | Obtener un producto por id |
| POST | `/api/products` | Crear un producto |
| PUT | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |

Los formularios de productos deben enviarse como `multipart/form-data` porque incluyen imágenes.

#### Campos del producto:

| Campo | Tipo | Requerido |
|---|---|---|
| `name` | string | Sí |
| `price` | number | Sí |
| `stock` | number | Sí |
| `description` | string | No |
| `sku` | string | No |
| `category_id` | number | No |
| `image` | File | No |

### Imágenes

Las imágenes se sirven como archivos estáticos desde:

```
http://localhost:3000/uploads/nombre-imagen.jpg
```

- Al eliminar un producto, la imagen se elimina automáticamente del servidor.
- Al actualizar la imagen de un producto, la imagen anterior se elimina automáticamente.
- Al eliminar una categoría con `deleteProducts=true`, las imágenes de los productos también se eliminan.

**A considerar:** se usa **Multer** para manejar la subida de imágenes en los endpoints de productos. Las imágenes se almacenan como archivos en la carpeta uploads/ y en la base de datos solo se guarda el nombre del archivo. La configuración de multer se encuentra en server/src/middlewares/upload.ts e incluye validación de tipo de archivo (JPG, PNG, WEBP) y un límite de 5MB por imagen.

## Otras consideraciones

- **SQLite en modo WAL:** mejora el rendimiento en lecturas concurrentes.
- **Foreign keys activadas explícitamente:** SQLite las desactiva por defecto, se activan con `PRAGMA foreign_keys = ON`.
- **AppError:** clase de error personalizada que permite lanzar errores con código HTTP desde cualquier capa y capturarlos en un único middleware global.
- **category_id opcional:** un producto puede existir sin categoría, quedando con `category_id = NULL`.
