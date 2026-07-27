# Estructura del proyecto

## Organización general

El proyecto es un monorepo con tres niveles: raíz, `client/` y `server/`. Cada subproyecto administra sus propias dependencias y configuraciones.

```
inventario/
├── client/                     # Frontend React
├── server/                     # Backend Express
├── docs/                       # Documentación del proyecto
├── package.json                # Scripts globales únicamente
└── .gitignore
```

El `package.json` raíz no reemplaza ni afecta a los `package.json` de `client/` y `server/`. Su único propósito es centralizar scripts globales como `npm run dev`, que levanta ambos servidores al mismo tiempo usando `concurrently`.

## Cliente (`client/`)

```
client/
├── src/
│   ├── components/             # Piezas de UI reutilizables
│   │   ├── Modal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── SearchInput.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── CategoryTable.tsx
│   │   ├── ProductTable.tsx
│   │   ├── CategoryForm.tsx
│   │   └── ProductForm.tsx
│   ├── pages/                  # Pantallas completas
│   │   ├── CategoriesPage.tsx
│   │   └── ProductsPage.tsx
│   ├── services/               # Comunicación con la API
│   │   ├── categoryService.ts
│   │   └── productService.ts
│   ├── types/                  # Definiciones de TypeScript
│   │   └── index.ts
│   ├── App.tsx                 # Componente raíz, orquesta qué página se muestra
│   ├── main.tsx                # Punto de entrada de React
│   └── index.css               # Estilos globales (importa Tailwind y define tokens)
├── package.json
└── vite.config.ts
```

### Criterio de organización

La estructura sigue una separación por **responsabilidad**, no por entidad. Esto significa que no existe una carpeta `/categories` con todo lo relacionado a categorías. En cambio:

- Los componentes visuales van en `components/`
- Las pantallas completas van en `pages/`
- Las llamadas a la API van en `services/`
- Los tipos TypeScript van en `types/`

Esto permite que al agregar una nueva pantalla se siga exactamente el mismo patrón sin reestructurar nada.

## Servidor (`server/`)

```
server/
├── src/
│   ├── categories/             # Módulo de categorías
│   │   ├── categories.repository.ts
│   │   ├── categories.service.ts
│   │   ├── categories.controller.ts
│   │   └── categories.router.ts
│   ├── products/               # Módulo de productos
│   │   ├── products.repository.ts
│   │   ├── products.service.ts
│   │   ├── products.controller.ts
│   │   └── products.router.ts
│   ├── db/
│   │   ├── database.ts         # Conexión a SQLite
│   │   ├── schema.ts           # Definición de tablas, índices y triggers
│   │   └── init.ts             # Inicialización de la base de datos
│   ├── errors/
│   │   └── AppError.ts         # Clase de error personalizada
│   ├── middlewares/
│   │   ├── errorHandler.ts     # Manejador global de errores
│   │   └── upload.ts           # Configuración de multer para imágenes
│   └── index.ts                # Punto de entrada del servidor
├── uploads/                    # Imágenes subidas (no se sube a Git)
├── package.json
└── tsconfig.json
```

### Criterio de organización

El backend se organiza por **módulo** (categories, products). Cada módulo contiene sus cuatro capas: repository, service, controller y router. Esto hace que al agregar un nuevo módulo se siga el mismo patrón sin tocar nada existente.

---

## Archivos que no se suben a Git

| Archivo / Carpeta  | Motivo                                        |
| ------------------ | --------------------------------------------- |
| `node_modules/`    | Dependencias, se reinstalan con `npm install` |
| `inventario.db`    | Base de datos con datos del cliente           |
| `server/uploads/*` | Imágenes subidas por el usuario               |
| `dist/`            | Build de producción generado automáticamente  |

La carpeta `uploads/` se rastrea en Git mediante un archivo `.gitkeep` vacío, para que la carpeta exista al clonar el repositorio pero su contenido no se suba.
