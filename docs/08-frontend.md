# Frontend

## Stack

| Herramienta     | Propósito                                        |
| --------------- | ------------------------------------------------ |
| React           | Construcción de la interfaz mediante componentes |
| Vite            | Servidor de desarrollo y build del proyecto      |
| TypeScript      | Tipado estático, coherente con el backend        |
| Tailwind CSS v4 | Estilos mediante clases de utilidad              |
| lucide-react    | Íconos del sidebar y la interfaz                 |

## Tipos de datos

Definidos en `client/src/types/index.ts`. Reflejan exactamente las tablas del backend.

```ts
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  stock: number;
  image: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
}
```

También existen `CategoryInput` y `ProductInput`, usados al crear o editar (sin `id` ni timestamps, ya que los genera el backend).

> **Importante:** los tipos asumen respuestas en `snake_case` desde el backend (por ejemplo `category_id`). Si la API cambia a `camelCase`, los tipos del frontend deben actualizarse.

## Servicios

Ubicados en `client/src/services/`. Son los únicos archivos que se comunican con la API. Ningún componente ni página llama a `fetch` directamente.

### `categoryService.ts`

CRUD completo de categorías.

```ts
getCategories()
getCategoryById(id)
createCategory(data: CategoryInput)
updateCategory(id, data: CategoryInput)
deleteCategory(id, deleteProducts?: boolean)
```

`deleteCategory` acepta un segundo parámetro opcional que se traduce en `?deleteProducts=true` en la URL.

### `productService.ts`

CRUD completo de productos. Las operaciones de crear y actualizar usan `FormData` porque el backend usa multer para las imágenes.

```ts
getProducts({ search?, categoryId? })
getProductById(id)
createProduct(data: FormData)
updateProduct(id, data: FormData)
deleteProduct(id)
```

Exporta `IMAGE_BASE_URL` para construir las URLs de las imágenes:

```ts
export const IMAGE_BASE_URL = "http://localhost:3000/uploads";
```

### Manejo de errores en servicios

Ambos servicios comparten el patrón `parseError`, que intenta leer el mensaje real del backend (`AppError`) antes de mostrar un mensaje genérico:

```ts
async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message ?? "Error desconocido";
  } catch {
    return "Error desconocido";
  }
}
```

---

## Componentes

### Componentes base

**`Modal.tsx`**
Ventana emergente genérica con altura máxima y scroll interno. Recibe `title`, `onClose` y `children`. Usada para los formularios de creación y edición. Al hacer click fuera del modal se cierra.

**`ConfirmDialog.tsx`**
Modal de confirmación independiente (no reutiliza `Modal`). Muestra un ícono de alerta grande, un mensaje inline y un checkbox opcional. Usado para confirmar eliminaciones. Reemplaza `window.confirm()` en toda la app.

El checkbox opcional se usa actualmente para "eliminar también los productos de esta categoría" al borrar una categoría.

**`SearchInput.tsx`**
Input de búsqueda con ícono. Recibe `value`, `onChange` y `placeholder`.

**`ErrorBanner.tsx`**
Banner de error con ícono y botón de cerrar. Recibe `message` y `onClose`.

### Tablas

**`CategoryTable.tsx`**
Lista categorías con:

- Avatar circular con inicial de categoría y color rotativo
- Columna de conteo de productos (calculado en el cliente a partir de la lista completa de productos)
- Acciones de editar y eliminar

**`ProductTable.tsx`**
Lista productos con:

- Miniatura de imagen (con ícono de ojo al hacer hover que abre un modal con la imagen completa)
- Nombre de categoría resuelto en el cliente (incluyendo `category_id = null` → "Sin categoría")
- Badge de stock tipo pastilla (verde = en stock, rojo = stock bajo, umbral `stock <= 5`)
- Checkboxes de selección individual y "seleccionar todos"
- Acciones de editar y eliminar

### Formularios

**`CategoryForm.tsx`**
Mismo formulario para crear y editar. Recibe `initialData` opcional (si se pasa, el formulario se pre-rellena para edición).

**`ProductForm.tsx`**
Mismo formulario para crear y editar. Incluye:

- Selector de imagen con preview
- Limpieza del error de cada campo apenas el usuario lo corrige
- Selector de categoría con opción "Sin categoría"

## Páginas

### `CategoriesPage.tsx`

- Carga categorías y productos (los productos se necesitan para calcular el conteo por categoría)
- Búsqueda local (filtra en el cliente, no hace peticiones al backend)
- Flujo de eliminación con `ConfirmDialog` y checkbox para eliminar también los productos asociados

### `ProductsPage.tsx`

- Carga productos vía API con `search` y `categoryId` como query params
- Búsqueda con debounce de 300ms para no hacer una petición por cada tecla
- Filtro por categoría incluyendo "Sin categoría" (resuelto en el cliente ya que no es un valor real de `categoryId`)
- Selección múltiple con checkboxes
- Eliminación masiva con `Promise.allSettled` (no se detiene si un borrado individual falla)

## Navegación

La navegación entre páginas se maneja con `useState` en `App.tsx`, sin React Router. La razón es que el alcance actual del proyecto (dos pantallas) no justifica la complejidad de un enrutador.

```ts
const [page, setPage] = useState<"categories" | "products">("products");
```

Si el proyecto crece con más pantallas, se recomienda evaluar la incorporación de React Router.

## Comunicación con el backend

El frontend se comunica con el backend a través de los servicios. Las peticiones van a `http://localhost:3000/api`.

Para formularios con imagen se usa `FormData`:

```ts
const formData = new FormData();
formData.append("name", data.name);
formData.append("price", String(data.price));
formData.append("stock", String(data.stock));
if (data.image) formData.append("image", data.image);

await createProduct(formData);
```

> **Importante:** los formularios con imagen no deben incluir el header `Content-Type: application/json`. El navegador lo establece automáticamente como `multipart/form-data` al usar `FormData`.
