# Referencia de API REST

## URL base

```
http://localhost:3000/api
```

## Códigos de respuesta

| Código | Significado                   |
| ------ | ----------------------------- |
| `200`  | OK - Petición exitosa         |
| `201`  | Created - Recurso creado      |
| `204`  | No Content - Éxito sin datos  |
| `400`  | Bad Request - Datos inválidos |
| `404`  | Not Found - Recurso no existe |
| `409`  | Conflict - Ya existe          |
| `500`  | Server Error - Error interno  |

## Formato de error

Todos los errores devuelven:

```json
{
  "message": "Descripción del error"
}
```

## Categorías

### Listar

```
GET /api/categories
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Electrónica",
    "description": "Componentes electrónicos",
    "created_at": "2026-01-01 12:00:00",
    "updated_at": "2026-01-01 12:00:00"
  }
]
```

### Obtener por ID

```
GET /api/categories/:id
```

**Errores:**

- `404` - Categoría no encontrada

### Crear

```
POST /api/categories
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Electrónica",
  "description": "Componentes electrónicos"
}
```

| Campo         | Tipo   | Requerido |
| ------------- | ------ | --------- |
| `name`        | string | ✅        |
| `description` | string | ❌        |

**Errores:**

- `400` - El nombre es requerido
- `409` - Ya existe una categoría con ese nombre

### Actualizar

```
PUT /api/categories/:id
Content-Type: application/json
```

**Body:** (mismo que crear)

**Errores:**

- `400` - El nombre es requerido
- `404` - Categoría no encontrada
- `409` - Ya existe una categoría con ese nombre

### Eliminar

```
DELETE /api/categories/:id
DELETE /api/categories/:id?deleteProducts=true
```

**Parámetros:**

- `deleteProducts=true` - También elimina todos los productos de esta categoría
- Sin parámetro - Los productos quedan con `category_id = null`

**Respuesta:** `204` (sin contenido)

**Errores:**

- `404` - Categoría no encontrada

---

## Productos

### Listar (con búsqueda y filtros)

```
GET /api/products
GET /api/products?search=raspberry
GET /api/products?categoryId=1
GET /api/products?search=raspberry&categoryId=1
```

**Parámetros:**

- `search` - Busca por nombre (búsqueda parcial)
- `categoryId` - Filtra por categoría

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Raspberry Pi",
    "description": "Mini computadora",
    "sku": "RASP-001",
    "price": 80000,
    "stock": 5,
    "image": "abc123-raspberry.jpg",
    "category_id": 1,
    "created_at": "2026-01-01 12:00:00",
    "updated_at": "2026-01-01 12:00:00"
  }
]
```

### Obtener por ID

```
GET /api/products/:id
```

**Errores:**

- `404` - Producto no encontrado

### Crear

```
POST /api/products
Content-Type: multipart/form-data
```

**Body (FormData):**
| Campo | Tipo | Requerido |
| --- | --- | --- |
| `name` | string | ✅ |
| `price` | number | ✅ |
| `stock` | number | ✅ |
| `description` | string | ❌ |
| `sku` | string | ❌ |
| `category_id` | number | ❌ |
| `image` | File (JPG/PNG/WEBP, máx 5MB) | ❌ |

**Respuesta:** `201` + objeto creado

**Errores:**

- `400` - El nombre/precio/stock es requerido
- `400` - El precio debe ser un número >= 0
- `400` - El stock debe ser un número >= 0
- `404` - Categoría no encontrada
- `409` - Ya existe un producto con ese SKU

### Actualizar

```
PUT /api/products/:id
Content-Type: multipart/form-data
```

**Body:** (mismo que crear)

**Respuesta:** `200` + objeto actualizado

**Errores:** (mismos que crear + 404 si no existe el producto)

### Eliminar

```
DELETE /api/products/:id
```

**Respuesta:** `204` (sin contenido)

**Errores:**

- `404` - Producto no encontrado

**Nota:** La imagen asociada se elimina automáticamente del servidor.

---

## Imágenes

Las imágenes se sirven como archivos estáticos:

```
http://localhost:3000/uploads/abc123-imagen.jpg
```

El campo `image` en la respuesta contiene solo el nombre del archivo. Para construir la URL completa:

```javascript
const imageUrl = `http://localhost:3000/uploads/${product.image}`;
```

---

## Ventas

### Procesar venta

```
POST /api/sales
Content-Type: application/json
```

**Body:**

```json
[
  { "product_id": 1, "quantity": 2 },
  { "product_id": 3, "quantity": 1 }
]
```

| Campo        | Tipo   | Descripción                    |
| ------------ | ------ | ------------------------------ |
| `product_id` | number | ID del producto                |
| `quantity`   | number | Cantidad a vender (entero > 0) |

**Respuesta:** `200` (sin contenido)

**Flujo:**

1. Valida que no esté vacío
2. Valida que no haya duplicados
3. Valida que las cantidades sean válidas
4. Verifica que los productos existan
5. Verifica que hay suficiente stock
6. Descuenta el stock de todos los productos
7. Si algo falla, se revierte TODO

**Errores:**

- `400` - El carrito está vacío
- `400` - El carrito tiene productos duplicados
- `400` - La cantidad debe ser un entero positivo
- `404` - Producto con id X no encontrado
- `409` - Stock insuficiente para el producto X
