# Manejo de errores

## Visión general

El manejo de errores sigue un flujo centralizado. En lugar de manejar los errores en cada controller por separado, todos los errores se lanzan desde el service y se capturan en un único middleware global (`errorHandler`).

```
Service lanza AppError
        │
        ▼
Controller captura con try/catch y llama next(error)
        │
        ▼
errorHandler transforma el error en respuesta HTTP
        │
        ▼
Cliente recibe { message: "..." } con el código HTTP apropiado
```

## AppError

Clase de error personalizada ubicada en `server/src/errors/AppError.ts`. Permite lanzar errores con un mensaje legible y un código HTTP desde cualquier capa.

```ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

**Uso en el service:**

```ts
throw new AppError("Categoría no encontrada", 404);
throw new AppError("El nombre es requerido", 400);
throw new AppError("El precio no puede ser negativo", 400);
```

## errorHandler

Middleware global ubicado en `server/src/middlewares/errorHandler.ts`. Registrado al final de `index.ts`, después de todas las rutas.

Maneja tres tipos de errores:

### 1. Errores controlados (AppError)

Errores lanzados explícitamente desde el service con un mensaje y código HTTP conocidos.

```ts
if (err instanceof AppError) {
  res.status(err.statusCode).json({ message: err.message });
  return;
}
```

### 2. Errores de SQLite

Errores lanzados por `better-sqlite3` al violar restricciones de la base de datos. Se traducen a mensajes legibles.

| Código SQLite                                                | Causa                                          | Respuesta                                                     |
| ------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------- |
| `SQLITE_CONSTRAINT_UNIQUE`                                   | Valor duplicado (name, sku)                    | `409` — Ya existe un registro con ese valor                   |
| `SQLITE_CONSTRAINT_FOREIGNKEY` o `SQLITE_CONSTRAINT_TRIGGER` | Restricción de llave foránea                   | `409` — No se puede eliminar porque tiene registros asociados |
| `SQLITE_CONSTRAINT_CHECK`                                    | Valor fuera del rango permitido (price, stock) | `400` — Valor fuera del rango permitido                       |

### 3. Errores inesperados

Cualquier error no contemplado se registra en consola y se responde con `500`.

```ts
console.error(err);
res.status(500).json({ message: "Error interno del servidor" });
```

## Flujo en el controller

Todos los métodos del controller siguen el mismo patrón: delegan al service dentro de un `try/catch` y pasan el error a `next` si algo falla.

```ts
create(req: Request, res: Response, next: NextFunction) {
  try {
    const result = productsService.create(req.body)
    res.status(201).json(result)
  } catch (error) {
    next(error)  // → va directo al errorHandler
  }
}
```

El controller no decide qué código HTTP devolver en caso de error, esa responsabilidad es del `errorHandler`.

## Validaciones en el service

Las validaciones de lógica de negocio se hacen en el service antes de llegar a la base de datos. Esto evita que SQLite tenga que lanzar un error para detectar datos inválidos.

**Validaciones de productos:**

| Validación                           | Error lanzado                           |
| ------------------------------------ | --------------------------------------- |
| `name` vacío o faltante              | `400` — El nombre es requerido          |
| `price` faltante                     | `400` — El precio es requerido          |
| `stock` faltante                     | `400` — El stock es requerido           |
| `price` no es número                 | `400` — El precio debe ser un número    |
| `stock` no es número                 | `400` — El stock debe ser un número     |
| `price` negativo                     | `400` — El precio no puede ser negativo |
| `stock` negativo                     | `400` — El stock no puede ser negativo  |
| `category_id` enviado pero no existe | `404` — Categoría no encontrada         |
| Producto no encontrado               | `404` — Producto no encontrado          |

**Validaciones de categorías:**

| Validación              | Error lanzado                   |
| ----------------------- | ------------------------------- |
| `name` vacío o faltante | `400` — El nombre es requerido  |
| Categoría no encontrada | `404` — Categoría no encontrada |

## Ruta no encontrada

Registrado en `index.ts` antes del `errorHandler`, captura cualquier petición a una ruta que no existe:

```ts
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});
```

## Resumen de códigos HTTP

| Código | Significado                                   |
| ------ | --------------------------------------------- |
| `200`  | Operación exitosa                             |
| `201`  | Recurso creado exitosamente                   |
| `204`  | operación exitosa sin contenido (eliminación) |
| `400`  | Datos inválidos o faltantes                   |
| `404`  | Recurso no encontrado                         |
| `409`  | Conflicto (duplicado o registros asociados)   |
| `500`  | Error interno del servidor                    |
