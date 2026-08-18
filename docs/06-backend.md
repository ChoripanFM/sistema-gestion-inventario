# Backend: cómo funciona

## Visión general

El backend es la capa encargada de recibir las peticiones del frontend, validar la información, aplicar reglas de negocio y acceder a la base de datos.

Se construye con **Express**, un framework para crear servidores en JavaScript y TypeScript. La estructura del proyecto está organizada en módulos y cada uno sigue una arquitectura por capas.

### Principios

- Cada módulo tiene una separación clara por responsabilidades.
- La comunicación ocurre siempre de una capa a la inmediata inferior.
- Las decisiones de negocio no se mezclan con la lógica de acceso a la base de datos.
- Los errores se centralizan para devolver respuestas HTTP consistentes.

## Arquitectura por capas

Cada módulo del backend, como `products`, `categories` y `sales`, sigue este flujo:

```
Petición HTTP del frontend
        ↓
1. Router        → define la ruta y aplica middlewares
        ↓
2. Controller    → extrae datos de la petición
        ↓
3. Service       → valida y ejecuta la lógica de negocio
        ↓
4. Repository    → consulta o modifica la base de datos
        ↓
      SQLite
        ↓
4. Repository    → devuelve el resultado de la consulta
        ↓
3. Service       → prepara la respuesta final
        ↓
2. Controller    → convierte la salida a HTTP
        ↓
1. Router        → responde al cliente
        ↓
Respuesta HTTP al frontend
```

Este patrón facilita la mantenibilidad del código y evita que una capa haga tareas que no le corresponden.

## Capa 1: Router

El router define las rutas disponibles y conecta cada endpoint con su controller. También se encarga de registrar middlewares específicos de la ruta.

**Archivo de ejemplo**: `server/src/products/products.router.ts`

```typescript
import { Router } from "express";
import { productsController } from "./products.controller.js";

const router = Router();

router.get("/", (req, res, next) => productsController.getAll(req, res, next));

router.post("/", upload.single("image"), (req, res, next) =>
  productsController.create(req, res, next),
);

export default router;
```

### Responsabilidad

- Definir URLs.
- Asociar cada ruta con una función del controller.
- Aplicar middleware como `upload.single("image")` o autenticación, si existe.

## Capa 2: Controller

Recibe la petición HTTP, extrae datos del `req` y delega el trabajo al Service. No contiene lógica de negocio. Captura errores con `try/catch` y los pasa al `errorHandler` con `next(error)`.

**Archivo de ejemplo**: `server/src/products/products.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { productsService } from "./products.service.js";

class ProductsController {
  getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extraer los datos de la petición
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;

      // 2. Delegar al Service
      const products = productsService.getAll({ search, categoryId });

      // 3. Devolver la respuesta HTTP
      res.json(products);
    } catch (error) {
      // Si hay error, pasarlo al manejador global
      next(error);
    }
  }

  create(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extraer los datos del body
      const result = productsService.create(req.body);

      // 2. Devolver código 201 (creado)
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const productsController = new ProductsController();
```

### Responsabilidad

- Leer parámetros, query strings, body y archivos.
- Delegar la lógica al service.
- Transformar el resultado en una respuesta HTTP.
- Capturar errores con `try/catch` y reenviarlos con `next(error)`.

## Capa 3: Service

El service es el punto donde se aplican las reglas de negocio. Aquí se validan los datos, se comprueban condiciones y se decide si una operación puede continuarse.

**Archivo de ejemplo**: `server/src/products/products.service.ts`

```typescript
import { productsRepository } from "./products.repository.js";
import { AppError } from "../errors/AppError.js";

export const productsService = {
  getAll(filters: { search?: string; categoryId?: string }) {
    // El Repository devuelve los datos
    return productsRepository.getAll(filters);
  },

  create(data) {
    // valida
    if (!data.name?.trim()) {
      throw new AppError("El nombre es requerido", 400);
    }

    if (typeof data.price !== "number" || data.price < 0) {
      throw new AppError("El precio no puede ser negativo", 400);
    }

    if (data.category_id) {
      // Verificar que la categoría existe
      const category = productsRepository.findCategoryById(data.category_id);
      if (!category) {
        throw new AppError("Categoría no encontrada", 404);
      }
    }

    // Si todo es válido, guardar en BD
    return productsRepository.create(data);
  },

  delete(id: number) {
    const product = productsRepository.findById(id);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    // Si existe, borrarlo
    return productsRepository.delete(id);
  },
};
```

### Responsabilidad

- Validar entradas.
- Aplicar reglas de negocio.
- Verificar si entidades relacionadas existen.
- Delegar la operación final al repository.

## Capa 4: Repository

El repository es el responsable del acceso a la base de datos. Aquí se escriben las consultas SQL y se trabaja directamente con `better-sqlite3`.

**Archivo de ejemplo**: `server/src/products/products.repository.ts`

```ts
create(data) {
  return db.prepare(`
    INSERT INTO products (name, price, stock, category_id)
    VALUES (?, ?, ?, ?)
  `).run(data.name, data.price, data.stock, data.category_id);
}
```

### Responsabilidad

- Ejecutar consultas SQL.
- Leer o guardar información en SQLite.
- Devolver los resultados a la capa superior.

## Tabla resumida de responsabilidades

| Capa           | Entrada principal | Función principal      | Salida                     |
| -------------- | ----------------- | ---------------------- | -------------------------- |
| **Router**     | URL y middleware  | Define rutas           | Llama al controller        |
| **Controller** | Petición HTTP     | Extrae y prepara datos | Llama al service           |
| **Service**    | Datos procesados  | Valida y aplica reglas | Llama al repository        |
| **Repository** | Datos validados   | Consulta o modifica BD | Resultado de base de datos |

## Manejo de errores

Cuando ocurre un problema de validación o de negocio, se lanza un `AppError`.

```typescript
import { AppError } from "../errors/AppError.js";

throw new AppError("Mensaje al usuario", CODIGO_HTTP);
```

### Ejemplos comunes

```typescript
throw new AppError("El nombre es requerido", 400); // Bad Request
throw new AppError("Producto no encontrado", 404); // Not Found
throw new AppError("Ya existe un producto con ese SKU", 409); // Conflict
```

El flujo del error es el siguiente:

```
Service: lanza AppError
  ↓
Controller: captura el error y hace next(error)
  ↓
errorHandler global: convierte el error en respuesta HTTP
  ↓
Frontend: recibe la respuesta con código y mensaje
```

## Estructura de un módulo nuevo

Si se crea un nuevo módulo, por ejemplo `inventories`, la estructura será:

```
server/src/inventories/
├── inventories.router.ts
├── inventories.controller.ts
├── inventories.service.ts
└── inventories.repository.ts
```

Luego se registra en `server/src/index.ts`:

```typescript
import inventoriesRouter from "./inventories/inventories.router.js";
app.use("/api/inventories", inventoriesRouter);
```

## ¿Cómo escribo código para el backend?

### Paso 1: Definir la ruta

```typescript
router.post("/", (req, res, next) => myController.create(req, res, next));
```

### Paso 2: Crear el controller

```typescript
create(req, res, next) {
  try {
    const result = myService.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

### Paso 3: Implementar validaciones en el service

```typescript
create(data) {
  if (!data.name) throw new AppError("Nombre requerido", 400);
  return myRepository.create(data);
}
```

### Paso 4: Ejecutar la operación en el repository

```typescript
create(data) {
  return db.prepare("INSERT INTO tabla (...) VALUES (...)").run(...);
}
```

Esta secuencia asegura que cada capa tenga un propósito claro y que el backend permanezca fácil de mantener.

## Middlewares globales

Los middlewares principales se registran en `index.ts` en este orden:

```
cors()             → permite conexiones desde el frontend
express.json()     → parsea el cuerpo JSON
/uploads           → sirve imágenes como archivos estáticos
/api/categories    → rutas de categorías
/api/products      → rutas de productos
404 handler        → responde con error si la ruta no existe
errorHandler       → captura errores finales y responde HTTP
```

El orden es importante: `errorHandler` debe colocarse al final para interceptar cualquier error que ocurra después de las rutas.

## Flujo completo de una petición

Ejemplo: `POST /api/products` con imagen incluida.

```
1. La petición llega al servidor.
2. cors() valida que el origen esté permitido.
3. upload.single("image") procesa el archivo y lo guarda en uploads/.
4. El controller extrae name, price, stock, category_id y req.file.filename.
5. El service valida los datos y verifica la existencia de la categoría.
6. El repository ejecuta el INSERT en SQLite.
7. El controller responde con un 201 y devuelve el producto creado.
```

Si falla cualquiera de los pasos de validación o persistencia, el error se propaga hasta `errorHandler`, que transforma la excepción en una respuesta HTTP con el código adecuado.

## Consideraciones técnicas

### ESModules

El proyecto usa `"type": "module"` en el `package.json` del servidor. Por eso, los imports deben incluir la extensión `.js`, aunque el archivo sea `.ts`.

### `tsx watch`

Se usa `tsx watch` en lugar de `ts-node` + `nodemon` porque ofrece un flujo más simple y rápido durante el desarrollo.
