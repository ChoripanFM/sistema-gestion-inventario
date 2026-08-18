# Sistema de gestión de inventario

Sistema de gestión de inventario diseñado para funcionar de forma local y para un usuario.

<img width="1276" height="658" alt="Screenshot 2026-08-18 121335" src="https://github.com/user-attachments/assets/37799cf0-aec9-4282-80b9-a37901355ba6" />

## Stack

- React + Vite + TypeScript
- Node.js + Express + TypeScript
- SQLite
- Electron para app de escritorio
- Tailwind CSS

## Funcionalidades

- CRUD de categorías y productos
- Carga y gestión de imágenes
- Búsqueda y filtrado por categoría
- Carrito de ventas con validación de stock
- Registro de ventas
- Resumen del día con:
  - total vendido
  - cantidad de ventas realizadas
  - productos vendidos agrupados por producto
- Descarga de respaldo del inventario en ZIP
- Base de datos e imágenes incluidas en el respaldo

## Requisitos

- Node.js 20 o superior

## Antes de ejecutar ⚠️: `better-sqlite3` y Electron

`better-sqlite3` es un módulo nativo compilado. Electron trae su propio Node.js interno, distinto al del sistema, así que el binario compilado para uno no sirve para el otro.

Si alternas entre correr el servidor local y la app empaquetada, es necesario recompilar según el entorno que estés usando:

```bash
cd server
npm rebuild better-sqlite3
```

Este es el comando recomendado para trabajar en el entorno de desarrollo.

Para usar Electron:

```bash
npm run rebuild:sqlite
```

Si aparece un error del tipo `NODE_MODULE_VERSION ... requiere ...`, normalmente es por esto y hay que recompilar para el entorno actual.

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

La app queda disponible en:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Estructura principal

```text
inventario/
├── client/          # Frontend React
├── docs/            # Documentación del proyecto
├── electron/        # App de escritorio
├── server/          # API y lógica de negocio
│   └── uploads/         # Imágenes del inventario
│   └── inventario.db        # Base de datos SQLite
│
├── package.json     # Scripts globales
├── README.md        # Documentación general
└── release/         # Build de Electron
```

## Endpoints principales

### Ventas

- `POST /api/sales` — procesar una venta
- `GET /api/sales/history` — obtener resumen del día

### Productos

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Categorías

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Respaldo

- `GET /api/backup` — descarga un ZIP con la base de datos y las imágenes del inventario

## Historial y respaldo

La página de historial muestra:

- total vendido del día
- cantidad total de ventas
- detalle de productos vendidos
- botón para descargar un respaldo del inventario

El respaldo se genera con una snapshot de SQLite y se entrega en formato ZIP, incluyendo:

- `inventario.db`
- carpeta `uploads/`

## Documentación

- [docs/00-leer-documentacion.md](docs/00-leer-documentacion.md)
- [docs/01-conceptos.md](docs/01-conceptos.md)
- [docs/02-correr-el-proyecto.md](docs/02-correr-el-proyecto.md)
- [docs/03-estructura.md](docs/03-estructura.md)
- [docs/04-frontend.md](docs/04-frontend.md)
- [docs/05-diseno-visual.md](docs/05-diseno-visual.md)
- [docs/06-backend.md](docs/06-backend.md)
- [docs/07-base-de-datos.md](docs/07-base-de-datos.md)
- [docs/08-api.md](docs/08-api.md)
- [docs/09-manejo-de-errores.md](docs/09-manejo-de-errores.md)
- [docs/10-imagenes.md](docs/10-imagenes.md)
- [docs/11-flujo-ejemplo.md](docs/11-flujo-ejemplo.md)
- [docs/12-integracion-futura.md](docs/12-integracion-futura.md)
- [docs/13-respaldo-de-datos.md](docs/13-respaldo-de-datos.md)
- [docs/14-aplicacion-de-escritorio.md](docs/14-aplicacion-de-escritorio.md)
