# API REST

## URL base

```
http://localhost:3000/api
```

## Formato de respuesta

Las respuestas exitosas devuelven JSON con los datos del recurso. Los errores siempre siguen este formato:

```json
{ "message": "descripción del error" }
```

## Categorías

### Listar todas las categorías

```
GET /api/categories
```

**Respuesta exitosa:** `200`

```json
[
  {
    "id": 1,
    "name": "Electrónica",
    "description": "Productos electrónicos",
    "created_at": "2026-01-01 12:00:00",
    "updated_at": "2026-01-01 12:00:00"
  }
]
```

---

### Obtener una categoría por id

```
GET /api/categories/:id
```

**Respuesta exitosa:** `200`

```json
{
  "id": 1,
  "name": "Electrónica",
  "description": "Productos electrónicos",
  "created_at": "2026-01-01 12:00:00",
  "updated_at": "2026-01-01 12:00:00"
}
```

**Errores posibles:**

| Código | Mensaje                 |
| ------ | ----------------------- |
| 404    | Categoría no encontrada |

### Crear una categoría

```
POST /api/categories
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Electrónica",
  "description": "Productos electrónicos"
}
```

| Campo         | Tipo   | Requerido |
| ------------- | ------ | --------- |
| `name`        | string | Sí        |
| `description` | string | No        |

**Respuesta exitosa:** `201`

**Errores posibles:**

| Código | Mensaje                             |
| ------ | ----------------------------------- |
| 400    | El nombre es requerido              |
| 409    | Ya existe un registro con ese valor |

---

### Actualizar una categoría

```
PUT /api/categories/:id
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Electrónica",
  "description": "Nueva descripción"
}
```

**Respuesta exitosa:** `200`

**Errores posibles:**

| Código | Mensaje                             |
| ------ | ----------------------------------- |
| 400    | El nombre es requerido              |
| 404    | Categoría no encontrada             |
| 409    | Ya existe un registro con ese valor |

### Eliminar una categoría

```
DELETE /api/categories/:id
DELETE /api/categories/:id?deleteProducts=true
```

| Parámetro             | Descripción                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `deleteProducts=true` | Elimina la categoría y todos sus productos asociados. Si no se envía, los productos quedan con `category_id = null`. |

**Respuesta exitosa:** `204` (sin contenido)

**Errores posibles:**

| Código | Mensaje                 |
| ------ | ----------------------- |
| 404    | Categoría no encontrada |

---

## Productos

### Listar y buscar productos

```
GET /api/products
GET /api/products?search=rasperry-pi
GET /api/products?categoryId=1
GET /api/products?search=rasperry-pi&categoryId=1
```

| Query param  | Descripción                         |
| ------------ | ----------------------------------- |
| `search`     | Busca por nombre (búsqueda parcial) |
| `categoryId` | Filtra por categoría                |

**Respuesta exitosa:** `200`

```json
[
  {
    "id": 1,
    "name": "Rasperry Pi",
    "description": "Descripción del producto",
    "sku": "RASP-001",
    "price": 80000,
    "stock": 5,
    "image": "1234567890-imagen.jpg",
    "category_id": 1,
    "created_at": "2026-01-01 12:00:00",
    "updated_at": "2026-01-01 12:00:00"
  }
]
```

### Obtener un producto por id

```
GET /api/products/:id
```

**Respuesta exitosa:** `200`

**Errores posibles:**

| Código | Mensaje                |
| ------ | ---------------------- |
| 404    | Producto no encontrado |

### Crear un producto

```
POST /api/products
Content-Type: multipart/form-data
```

**Body (FormData):**

| Campo         | Tipo                            | Requerido |
| ------------- | ------------------------------- | --------- |
| `name`        | string                          | Sí        |
| `price`       | number                          | Sí        |
| `stock`       | number                          | Sí        |
| `description` | string                          | No        |
| `sku`         | string                          | No        |
| `category_id` | number                          | No        |
| `image`       | File (JPG, PNG, WEBP, máx. 5MB) | No        |

**Respuesta exitosa:** `201`

**Errores posibles:**

| Código | Mensaje                             |
| ------ | ----------------------------------- |
| 400    | El nombre es requerido              |
| 400    | El precio es requerido              |
| 400    | El stock es requerido               |
| 400    | El precio debe ser un número        |
| 400    | El stock debe ser un número         |
| 400    | El precio no puede ser negativo     |
| 400    | El stock no puede ser negativo      |
| 404    | Categoría no encontrada             |
| 409    | Ya existe un registro con ese valor |

### Actualizar un producto

```
PUT /api/products/:id
Content-Type: multipart/form-data
```

**Body (FormData):** mismos campos que crear. Si se sube una imagen nueva, la anterior se elimina automáticamente del servidor.

**Respuesta exitosa:** `200`

**Errores posibles:** mismos que crear, más:

| Código | Mensaje                |
| ------ | ---------------------- |
| 404    | Producto no encontrado |

### Eliminar un producto

```
DELETE /api/products/:id
```

Al eliminar un producto, su imagen se elimina automáticamente del servidor.

**Respuesta exitosa:** `204` (sin contenido)

**Errores posibles:**

| Código | Mensaje                |
| ------ | ---------------------- |
| 404    | Producto no encontrado |

## Imágenes

Las imágenes se sirven como archivos estáticos desde:

```
GET http://localhost:3000/uploads/:filename
```

El campo `image` en la respuesta de un producto contiene solo el nombre del archivo. Para construir la URL completa:

```ts
const imageUrl = `http://localhost:3000/uploads/${product.image}`;
```

---

## Errores globales

| Código | Mensaje                    | Causa                           |
| ------ | -------------------------- | ------------------------------- |
| 404    | Ruta no encontrada         | El endpoint no existe           |
| 500    | Error interno del servidor | Error inesperado en el servidor |
