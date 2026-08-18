# Base de datos

## Motor de base de datos

El proyecto utiliza **SQLite** como motor principal a través de la librería `better-sqlite3`. La base de datos se almacena en el archivo `inventario.db`, ubicado en la raíz del proyecto. Este archivo se crea automáticamente la primera vez que el servidor se inicia.

## better-sqlite3

`better-sqlite3` hace que el código más simple y fácil de entender para cualquier desarrollador que conozca SQL básico.

```typescript
// Leer
const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
const allProducts = db.prepare("SELECT * FROM products").all();

// Crear
db.prepare("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)").run(
  name,
  price,
  stock,
);

// Actualizar
db.prepare("UPDATE products SET name = ? WHERE id = ?").run(newName, id);

// Borrar
db.prepare("DELETE FROM products WHERE id = ?").run(id);
```

**Importante**: Siempre usar `?` para los parámetros (para evitar SQL injection).

## Configuración

La conexión se establece en `server/src/db/database.ts` con dos configuraciones importantes:

```ts
db.pragma("journal_mode = WAL"); // mejora el rendimiento en lecturas concurrentes
db.pragma("foreign_keys = ON"); // activa las restricciones de clave foránea
```

SQLite desactiva las claves foráneas por defecto, por lo que es necesario habilitarlas explícitamente.

## Inicialización

Cuando el servidor se levanta, el flujo de inicialización se ejecuta en este orden:

```
npm run dev
    │
    ▼
index.ts importa db/init.ts
    │
    ▼
database.ts → establece la conexión a SQLite
    │
    ▼
schema.ts → crea tablas, índices y triggers si no existen
    │
    ▼
Servidor listo
```

Todos los `CREATE` incluyen `IF NOT EXISTS`, lo que permite ejecutar la inicialización en cada arranque sin riesgo de sobrescribir información ya almacenada.

## Esquema de tablas

### `categories`

La tabla `categories` almacena las categorías disponibles para clasificar los productos.

| Campo         | Tipo    | Restricciones                    | Descripción                   |
| ------------- | ------- | -------------------------------- | ----------------------------- |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT        | Identificador único           |
| `name`        | TEXT    | NOT NULL UNIQUE                  | Nombre de la categoría        |
| `description` | TEXT    | —                                | Descripción opcional          |
| `created_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de creación             |
| `updated_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de última actualización |

### `products`

La tabla `products` guarda la información principal de cada artículo del inventario.

| Campo         | Tipo    | Restricciones                    | Descripción                                |
| ------------- | ------- | -------------------------------- | ------------------------------------------ |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT        | Identificador único                        |
| `name`        | TEXT    | NOT NULL                         | Nombre del producto                        |
| `description` | TEXT    | —                                | Descripción opcional                       |
| `sku`         | TEXT    | UNIQUE                           | Código de producto opcional                |
| `price`       | REAL    | NOT NULL DEFAULT 0, CHECK >= 0   | Precio del producto, sin valores negativos |
| `stock`       | INTEGER | NOT NULL DEFAULT 0, CHECK >= 0   | Cantidad disponible, sin valores negativos |
| `image`       | TEXT    | —                                | Nombre del archivo de imagen               |
| `category_id` | INTEGER | —                                | Clave foránea a `categories.id`            |
| `created_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de creación                          |
| `updated_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de última actualización              |

## Relaciones

Un producto puede pertenecer a una categoría o no tener ninguna (`category_id = NULL`). Una categoría puede tener muchos productos o ninguno.

Cuando se elimina una categoría, los productos asociados pasan a quedar con `category_id = NULL` de forma predeterminada. Si se utiliza el parámetro `?deleteProducts=true`, los productos relacionados se eliminan junto con la categoría.

## Índices

```sql
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
```

Estos índices optimizan las consultas más frecuentes, como filtrar productos por categoría o buscar productos por nombre.

## Triggers

Los triggers mantienen `updated_at` sincronizado automáticamente, de modo que no es necesario actualizar este campo manualmente en cada operación de modificación.

```sql
CREATE TRIGGER IF NOT EXISTS trg_categories_updated_at
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
  UPDATE categories SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = datetime('now') WHERE id = OLD.id;
END;
```

## Transacciones

Se usan transacciones cuando una operación requiere múltiples pasos que deben ejecutarse juntos o no ejecutarse. Si algo falla a mitad del proceso, ningún cambio se aplica.

Ejemplo: eliminar una categoría junto con todos sus productos:

```ts
const transaction = db.transaction(() => {
  deleteProducts.run(id);
  deleteCategory.run(id);
});

transaction();
```

## Verificación de la base de datos

Para inspeccionar las tablas y datos durante el desarrollo, si se está usando VS code, se recomienda instalar la extensión **SQLite Viewer** y abrir el archivo `inventario.db` directamente desde el explorador de archivos.
