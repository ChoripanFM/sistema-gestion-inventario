# Estructura de carpetas

## Vista general

```
inventario/
├── client/                    # Frontend (interfaz en el navegador)
├── server/                    # Backend (servidor que procesa datos)
├── electron/                  # App de escritorio (Electron)
├── docs/                      # Esta documentación
├── package.json               # Scripts globales (npm run dev, npm run dist)
└── inventario.db              # Base de datos (se crea automáticamente)
```

## Frontend: `client/`

Aquí está todo lo que se ve en pantalla (React):

```
client/
├── src/
│   │   ├── CategoryTable.tsx  # Tabla de categorías
│   │   ├── ConfirmDialog.tsx  # Modal de confirmación
│   │   ├── ErrorBanner.tsx    # Mensaje de error
│   │   ├── Modal.tsx          # Ventana emergente genérica
│   │   ├── ProductForm.tsx    # Formulario producto
│   │   ├── ProductTable.tsx   # Tabla de productos
│   │   └── SearchInput.tsx    # Input de búsqueda
│   │
│   ├── pages/                 # Pantallas completas
│   │   ├── CategoriesPage.tsx # Página de categorías
│   │   ├── SalesPage.tsx      # Página de ventas
│   │   └── ProductsPage.tsx   # Página de productos
│   │
│   ├── services/              # Comunica con el servidor
│   │   ├── categoryService.ts # Peticiones de categorías
│   │   ├── productService.ts  # Peticiones de productos
│   │   └── salesService.ts    # Peticiones de ventas
│   │
│   ├── types/
│   │   └── index.ts           # Definiciones de datos (TypeScript)
│   │
│   ├── App.tsx                # Componente principal, maneja la navegación
│   └── index.css              # Estilos globales y tokens de diseño (Tailwind)
│
└── package.json               # Dependencias del frontend
```

### Criterio de organización del frontend

La estructura sigue una separación por **responsabilidad**, no por entidad. Esto significa que no existe una carpeta `/products` con todo lo relacionado a productos. En cambio:

- Las pantallas completas van en `pages/`
- Los componentes visuales reutilizables van en `components/`
- Las llamadas a la API van en `services/`
- Los tipos TypeScript van en `types/`
  Esto permite agregar nuevas pantallas siguiendo siempre el mismo patrón.

## Backend: `server/`

Aquí está el servidor que procesa los datos (Express + Node.js):

```
server/
├── src/
│   ├── categories/            # Módulo de categorías
│   │   ├── categories.controller.ts
│   │   ├── categories.repository.ts
│   │   ├── categories.router.ts
│   │   └── categories.service.ts
│   │
│   ├── products/              # Módulo de productos
│   │   ├── products.controller.ts
│   │   ├── products.repository.ts
│   │   ├── products.router.ts
│   │   └── products.service.ts
│   │
│   ├── sales/                 # Módulo de ventas
│   │   ├── sales.controller.ts
│   │   ├── sales.repository.ts
│   │   ├── sales.router.ts
│   │   └── sales.service.ts
│   │
│   ├── db/                    # Base de datos
│   │   ├── database.ts        # Conexión a SQLite
│   │   ├── init.ts            # Estructura de tablas
│   │   └── schema.ts          # Inicialización
│   │
│   ├── errors/
│   │   └── AppError.ts        # Clase de error personalizada
│   │
│   ├── middlewares/           # Procesamiento de peticiones
│   │   ├── errorHandler.ts    # Manejo de errores global
│   │   └── upload.ts          # Procesamiento de imágenes
│   │
│   └── index.ts               # Punto de entrada del servidor
│
├── uploads/                   # Imágenes subidas (no se sube a Git)
└── package.json               # Dependencias del backend
```

### Criterio de organización del backend

El backend se organiza por **módulo** (categories, products, sales). Cada módulo contiene sus cuatro capas: router, controller, service y repository. Al agregar un nuevo módulo se sigue el mismo patrón sin tocar nada existente.

## Archivos a destacar

## Archivos a destacar

| Archivo                | Qué hace                                                      |
| ---------------------- | ------------------------------------------------------------- |
| `package.json` (raíz)  | Scripts globales: `npm run dev`, `npm run dist`               |
| `inventario.db`        | Base de datos SQLite (se crea sola la primera vez)            |
| `client/src/App.tsx`   | Componente principal, maneja la navegación entre páginas      |
| `client/src/index.css` | Tokens de diseño (colores, tipografía) definidos con Tailwind |
| `server/src/index.ts`  | Punto de entrada del backend                                  |
| `server/uploads/`      | Carpeta donde se guardan las imágenes subidas                 |
| `.gitignore`           | Archivos que no se suben a Git (node_modules, BD, imágenes)   |
