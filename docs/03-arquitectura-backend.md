# Arquitectura del backend

## Visión general

El backend sigue una **arquitectura por capas**. Cada petición HTTP pasa por cuatro capas antes de llegar a la base de datos, y la respuesta recorre el mismo camino de vuelta.

```
    Cliente
        │
        ▼
    Router             → define los endpoints y aplica middlewares
        │
        ▼
    Controller         → recibe la petición y devuelve la respuesta HTTP
        │
        ▼
    Service            → lógica de negocio y validaciones
        │
        ▼
    Repository         → acceso a la base de datos
        │
        ▼
    Base de datos
```

## Responsabilidad de cada capa

### Router

Define las rutas disponibles y los middlewares que se aplican antes del controller. Por ejemplo, aplica `multer` en las rutas que reciben imágenes.

```ts
router.post("/", upload.single("image"), (req, res, next) =>
  productsController.create(req, res, next),
);
```

### Controller

Recibe la petición HTTP, extrae los datos del `req` y delega al service. No contiene lógica de negocio ni accede a la base de datos directamente. Captura errores y los pasa al `errorHandler` con `next(error)`.

```ts
create(req: Request, res: Response, next: NextFunction) {
  try {
    const result = productsService.create(req.body)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}
```

### Service

Contiene toda la lógica de negocio. Incluye validaciones, reglas, y coordinación entre repositorios. Es la única capa que lanza `AppError`. No sabe nada de HTTP.

```ts
create(data) {
  if (!data.name?.trim()) throw new AppError("El nombre es requerido", 400)
  const category = categoriesRepository.findById(data.category_id)
  if (!category) throw new AppError("Categoría no encontrada", 404)
  return productsRepository.create(data)
}
```

### Repository

Accede a la base de datos mediante consultas SQL directas (`better-sqlite3`). No contiene lógica de negocio. Recibe datos ya validados desde el service.

```ts
create(data) {
  return db.prepare(`
    INSERT INTO products (name, price, stock, category_id)
    VALUES (?, ?, ?, ?)
  `).run(data.name, data.price, data.stock, data.category_id)
}
```

## Reglas importantes

| Capa       | Puede acceder a            | No puede acceder a         |
| ---------- | -------------------------- | -------------------------- |
| Router     | Controller, middlewares    | Service, Repository        |
| Controller | Service                    | Repository, base de datos  |
| Service    | Repository, otros Services | base de datos directamente |
| Repository | Base de datos              | Service, Controller        |

Estas reglas evitan que la lógica se mezcle entre capas.

## Middlewares globales

Registrados en `index.ts` en este orden:

```
cors()             → permite peticiones desde el frontend
express.json()     → parsea el body JSON
/uploads           → sirve imágenes como archivos estáticos
/api/categories    → rutas de categorías
/api/products      → rutas de productos
404 handler        → responde con error si la ruta no existe
errorHandler       → captura todos los errores y los transforma en respuestas HTTP
```

El orden importa: `errorHandler` siempre va al final, después de todas las rutas.

## Flujo de una petición completa

Ejemplo: `POST /api/products` con imagen incluida.

```
1. La petición llega al servidor
2. cors() verifica que el origen está permitido
3. upload.single("image") procesa el archivo y lo guarda en uploads/
4. El controller extrae name, price, stock, category_id y req.file.filename
5. El service valida los datos y verifica que la categoría existe
6. El repository ejecuta el INSERT en SQLite
7. El controller responde con 201 y los datos del producto creado
```

Si algo falla en el paso 5 o 6, el error llega al `errorHandler` que lo transforma en una respuesta HTTP con el código y mensaje apropiado.

## Consideraciones técnicas

**better-sqlite3:** las consultas SQL se escriben directamente con `better-sqlite3`. Esto hace el código más simple y fácil de entender para cualquier desarrollador que conozca SQL básico.

**ESModules:** el proyecto usa `"type": "module"` en el `package.json` del servidor. Los imports deben incluir la extensión `.js` aunque el archivo sea `.ts`.

**tsx watch:** se usa en lugar de `ts-node` + `nodemon` porque es más rápido y no requiere configuración adicional.
