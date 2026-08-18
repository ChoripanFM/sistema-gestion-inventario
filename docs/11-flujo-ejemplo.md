# Ejemplo paso a paso: Crear un producto

Para entender cómo funciona el proyecto, vamos a seguir UN EJEMPLO REAL: lo que sucede cuando haces click en "Crear Producto".

## Flujo completo: Crear un producto

Cuando se hace click en "Crear producto", esto sucede:

```
1. Click en botón guardar en el navegador (Frontend)
   ↓
2. React recolecta los datos del formulario
   ↓
3. El servicio (productService.ts) prepara una petición HTTP POST
   ↓
4. La petición llega al servidor (Backend)
   ↓
5. Express la recibe en el Router
   ↓
6. El Controller extrae los datos
   ↓
7. El Service valida (¿es válido? ¿ya existe?)
   ↓
8. El Repository ejecuta INSERT en SQLite
   ↓
9. La base de datos guarda el nuevo producto
   ↓
10. La respuesta vuelve por el mismo camino
    ↓
11. React recibe el producto creado y actualiza la pantalla
```

## 1: Frontend recolecta datos

**Archivo**: `client/src/pages/ProductsPage.tsx`

Al hacer click en "Crear", el componente recolecta los datos:

```javascript
const formData = new FormData();
formData.append("name", "Raspberry Pi");
formData.append("price", "80000");
formData.append("stock", "5");
```

## 2: Frontend envía petición HTTP

**Archivo**: `client/src/services/productService.ts`

El servicio prepara la petición y la envía al servidor:

```typescript
export async function createProduct(data: FormData): Promise<Product> {
  const response = await fetch("http://localhost:3000/api/products", {
    method: "POST",
    body: data,
  });

  if (!response.ok) {
    throw new Error("Error al crear producto");
  }

  return response.json();
}
```

**Lo importante**: El frontend NO sabe cómo crear el producto. Solo PREGUNTA al backend: "Oye servidor, crea este producto".

## 3: Petición llega al Backend

La petición HTTP viaja y llega al servidor en puerto 3000.

```
PETICIÓN HTTP
POST http://localhost:3000/api/products
Body: { name: "Raspberry Pi", price: "80000", stock: "5" }
```

## 4: Router recibe la petición

**Archivo**: `server/src/products/products.router.ts`

Express (el servidor) tiene un "recepcionista" llamado Router que dice: "Ah, es una petición POST a /api/products. Voy a llamar al Controller de productos".

```typescript
import { productsController } from "./products.controller.js";

const router = Router();

router.post("/", (req, res, next) => productsController.create(req, res, next));
```

## Paso 5: Controller procesa la petición HTTP

**Archivo**: `server/src/products/products.controller.ts`

El Controller es como un secretario:

1. Lee la petición HTTP (`req`)
2. Extrae los datos
3. Le dice al Service: "Oye, crea un producto con estos datos"
4. El Service responde con el nuevo producto
5. El Controller devuelve la respuesta HTTP

```typescript
create(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Extrae los datos de la petición
    const result = productsService.create(req.body);

    // 2. Devuelve la respuesta HTTP
    res.status(201).json(result);
  } catch (error) {
    next(error);  // Si hay error, lo manda al manejador global
  }
}
```

**Importante**: El Controller NO decide si el precio es válido. Solo captura errores.

## Paso 6: Service valida los datos

**Archivo**: `server/src/products/products.service.ts`

El Service es como un gerente que toma decisiones:

1. ¿El nombre está vacío? → Error
2. ¿El precio es negativo? → Error
3. ¿La categoría existe? → Verificar
4. Todo OK → Ir al Repository

```typescript
create(data: ProductInput) {
  // Validar
  if (!data.name?.trim()) {
    throw new AppError("El nombre es requerido", 400);
  }

  if (data.price < 0) {
    throw new AppError("El precio no puede ser negativo", 400);
  }

  // Si todo es correcto, delegar al Repository
  return productsRepository.create(data);
}
```

## Paso 7: Repository accede a la base de datos

**Archivo**: `server/src/products/products.repository.ts`

El Repository es como un empleado que va al archivo de datos:

1. Ejecuta el SQL `INSERT` en la base de datos
2. Devuelve el nuevo producto creado

```typescript
create(data: ProductInput) {
  const result = db.prepare(`
    INSERT INTO products (name, price, stock, category_id)
    VALUES (?, ?, ?, ?)
  `).run(data.name, data.price, data.stock, data.category_id);

  return {
    id: result.lastInsertRowid,
    ...data
  };
}
```

## Paso 8: Base de datos guarda el dato

**Archivo**: `inventario.db` (SQLite)

La base de datos ejecuta:

```sql
INSERT INTO products (name, price, stock, category_id)
VALUES ('Raspberry Pi', 80000, 5, NULL)
```

La tabla de productos ahora tiene:

```
id  │ name          │ price  │ stock │
────┼───────────────┼────────┼───────┤
1   │ Raspberry Pi  │ 80000  │ 5     │
```

## Paso 9: Respuesta vuelve por el mismo camino

La respuesta viaja de vuelta:

```
Repository devuelve:
  { id: 1, name: "Raspberry Pi", price: 80000, stock: 5 }
    ↓
Service la recibe y la pasa al Controller
    ↓
Controller la devuelve como HTTP 201 (creado)
    ↓
Frontend la recibe y actualiza la pantalla
```

## Paso 10: Frontend actualiza la pantalla

**Archivo**: `client/src/pages/ProductsPage.tsx`

El frontend recibe el nuevo producto y lo agrega a la lista:

```typescript
const newProduct = await createProduct(formData);

// Actualizar la lista visible
setProducts([...products, newProduct]);

// Cerrar el modal
closeModal();

// Mostrar mensaje de éxito
showSuccess("Producto creado");
```

Ahora VES el nuevo producto en la tabla. ¡Listo!

## Resumen del flujo

```
1. Click en botón "Crear"
   ↓
2. Frontend recolecta datos
   ↓
3. Frontend envía POST a http://localhost:3000/api/products
   ↓
4. Router recibe (→ va a Controller)
   ↓
5. Controller extrae datos (→ va a Service)
   ↓
6. Service valida (→ va a Repository)
   ↓
7. Repository ejecuta INSERT en SQLite
   ↓
8. Base de datos guarda el nuevo registro
   ↓
9. Respuesta vuelve con el producto creado
   ↓
10. Frontend actualiza la pantalla
    ↓
11. VES el nuevo producto en la lista
```

## ¿Qué pasaría si hay error?

Si el precio es negativo:

```
Service hace: throw new AppError("El precio no puede ser negativo", 400)
  ↓
Controller lo captura y hace: next(error)
  ↓
errorHandler global lo recibe y devuelve HTTP 400 con el mensaje
  ↓
Frontend recibe el error y muestra un banner rojo: "El precio no puede ser negativo"
  ↓
El usuario no ve el producto creado (porque no se guardó)
```

## Lo importante de este ejemplo

**Los errores se capturan en el camino**:

- Si algo falla en el Service, se detiene todo
- El error se devuelve al Frontend
- El Frontend lo muestra al usuario

**La BD solo se modifica si todo es válido**:

- El Service valida ANTES de ir al Repository
- Si falla la validación, ni siquiera se intenta guardar
