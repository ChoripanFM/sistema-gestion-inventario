# Base de datos

## Motor

Se usa **SQLite** a través de la librería `better-sqlite3`. La base de datos se genera en `inventario.db`, en la raíz del proyecto. Este archivo se crea automáticamente la primera vez que se inicia el servidor.

## Configuración

La conexión se establece en `server/src/db/database.ts` con dos configuraciones importantes:

```ts
db.pragma("journal_mode = WAL"); // mejora el rendimiento en lecturas concurrentes
db.pragma("foreign_keys = ON"); // activa las restricciones de llave foránea
```

SQLite desactiva las llaves foráneas por defecto, por eso es necesario activarlas explícitamente.

## Inicialización

Al iniciar el servidor, `server/src/db/init.ts` importa `database.ts` y `schema.ts` en orden:

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

Todos los `CREATE` usan `IF NOT EXISTS`, por lo que son seguros de ejecutar en cada arranque sin riesgo de sobreescribir datos existentes.

## Tablas

### `categories`

| Campo         | Tipo    | Restricciones                    | Descripción                   |
| ------------- | ------- | -------------------------------- | ----------------------------- |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT        | Identificador único           |
| `name`        | TEXT    | NOT NULL UNIQUE                  | Nombre de la categoría        |
| `description` | TEXT    | —                                | Descripción opcional          |
| `created_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de creación             |
| `updated_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de última actualización |

### `products`

| Campo         | Tipo    | Restricciones                    | Descripción                     |
| ------------- | ------- | -------------------------------- | ------------------------------- |
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT        | Identificador único             |
| `name`        | TEXT    | NOT NULL                         | Nombre del producto             |
| `description` | TEXT    | —                                | Descripción opcional            |
| `sku`         | TEXT    | UNIQUE                           | Código de producto opcional     |
| `price`       | REAL    | NOT NULL DEFAULT 0, CHECK >= 0   | Precio sin valores negativos    |
| `stock`       | INTEGER | NOT NULL DEFAULT 0, CHECK >= 0   | Stock sin valores negativos     |
| `image`       | TEXT    | —                                | Nombre del archivo de imagen    |
| `category_id` | INTEGER | —                                | Llave foránea a `categories.id` |
| `created_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de creación               |
| `updated_at`  | TEXT    | NOT NULL DEFAULT datetime('now') | Fecha de última actualización   |

## Relaciones

Un producto puede pertenecer a una categoría o no tener ninguna (`category_id = NULL`). Una categoría puede tener muchos productos o ninguno.

Al eliminar una categoría, los productos asociados quedan con `category_id = NULL`, a menos que se use el parámetro `?deleteProducts=true` que los elimina junto con la categoría.

## Índices

```sql
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
```

Estos índices aceleran las consultas más frecuentes: filtrar productos por categoría y buscar productos por nombre.

---

## Triggers

Los triggers mantienen `updated_at` sincronizado automáticamente, por lo que no hay necesidad de actualizarlo manualmente en cada consulta:

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

## Verificar la base de datos

Para inspeccionar las tablas y datos durante el desarrollo, se recomienda instalar la extensión **SQLite Viewer** en VS Code y abrir el archivo `inventario.db` directamente desde el explorador de archivos.
