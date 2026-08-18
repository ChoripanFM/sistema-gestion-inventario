# Frontend: Cómo funciona

## Resumen rápido

El frontend está hecho con **React**, una librería para crear interfaces dinámicas.

**Importante**:

- Usar **TypeScript** para evitar errores
- Los servicios son los únicos que hablan con el servidor (no usar `fetch` directamente)
- Los componentes pequeños se reutilizan

## Stack

| Herramienta     | Propósito                                        |
| --------------- | ------------------------------------------------ |
| React           | Construcción de la interfaz mediante componentes |
| Vite            | Servidor de desarrollo y build del proyecto      |
| TypeScript      | Tipado estático, coherente con el backend        |
| Tailwind CSS v4 | Estilos mediante clases de utilidad              |
| lucide-react    | Íconos del sidebar y la interfaz                 |

## Cómo está organizado

```
client/src/
├── pages/         ← Pantallas completas (ProductsPage, CategoriesPage, etc)
├── components/    ← Piezas pequeñas reutilizables (Modal, Button, ErrorBanner, etc)
├── services/      ← Comunicación con el servidor (productService, categoryService, etc)
├── types/         ← Definiciones de datos (Product, Category, etc)
└── App.tsx        ← Página principal
```

## Las 3 responsabilidades

### 1. Páginas (pages/)

Una página es una **pantalla completa** que ve el usuario. Cada página:

- Carga datos del servidor
- Muestra componentes
- Maneja eventos del usuario

| Página               | Qué hace                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ProductsPage.tsx`   | Tabla de productos, búsqueda en servidor con debounce, filtro por categoría, selección múltiple y borrado masivo |
| `HistoryPage.tsx`    | Resumen del día, total vendido, ventas realizadas y detalle de productos vendidos                                |
| `CategoriesPage.tsx` | Tabla de categorías, búsqueda local, conteo de productos por categoría                                           |
| `SalesPage.tsx`      | Carrito de ventas con descuento automático de stock                                                              |

### 2. Componentes (components/)

Un componente es una **pieza pequeña reutilizable**:

| Componente          | Qué hace                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `Modal.tsx`         | Ventana emergente genérica con scroll interno, usada para formularios                    |
| `ConfirmDialog.tsx` | Modal de confirmación con checkbox opcional. Reemplaza `window.confirm()` en toda la app |
| `ErrorBanner.tsx`   | Banner de error con botón de cerrar                                                      |
| `SearchInput.tsx`   | Input de búsqueda con ícono                                                              |
| `ProductTable.tsx`  | Tabla de productos con miniaturas, badges de stock y checkboxes                          |
| `CategoryTable.tsx` | Tabla de categorías con avatar de inicial y conteo de productos                          |
| `ProductForm.tsx`   | Formulario de crear/editar producto con preview de imagen                                |
| `CategoryForm.tsx`  | Formulario de crear/editar categoría                                                     |

**Consejo**: Si se usa algo en 2 o más lugares, hacerlo componente.

### 3. Servicios (services/)

Un servicio es un archivo que se **comunica con el servidor**:

| Componente           | Qué hace                                             |
| -------------------- | ---------------------------------------------------- |
| `backupService.ts`   | Genera y descarga el respaldo del inventario         |
| `categoryService.ts` | Lo mismo para categorías                             |
| `productService.ts`  | Pide productos al servidor, crea, edita, borra       |
| `salesService.ts`    | Procesa ventas, descuenta stock y consulta historial |

**Importante**: Ningún componente llama directamente a `fetch()`. Siempre va a través del servicio.

```typescript
// INCORRECTO
function ProductsPage() {
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);
}

// CORRECTO
function ProductsPage() {
  useEffect(() => {
    getProducts().then(setProducts); // getProducts viene del servicio
  }, []);
}
```

## Tipos de datos (types/index.ts)

Los tipos definen qué datos se espera recibir del servidor. **Deben coincidir exactamente con lo que devuelve el backend**.

```typescript
export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  stock: number;
  image: string | null;
  category_id: number | null; // ← snake_case porque el backend usa snake_case
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesHistory {
  date: string;
  totalSales: number;
  salesCount: number;
  products: Array<{
    productId: number | null;
    productName: string;
    quantity: number;
  }>;
}
```

**Importante**: Si el backend cambia un campo (por ejemplo de `category_id` a `categoryId`), hay que actualizar este archivo también.

## Servicios: Cómo funcionan

Un servicio recolecta todas las peticiones a un recurso específico e incluye manejo de errores:

```typescript
// client/src/services/productService.ts

// URL base para construir las URLs de las imágenes
export const IMAGE_BASE_URL = "http://localhost:3000/uploads";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message || "Error desconocido";
  } catch {
    return "Error desconocido";
  }
}

export async function getProducts({
  search,
  categoryId,
}: { search?: string; categoryId?: number } = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categoryId) params.append("categoryId", String(categoryId));

  const response = await fetch(`http://localhost:3000/api/products?${params}`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function createProduct(data: FormData): Promise<Product> {
  const response = await fetch("http://localhost:3000/api/products", {
    method: "POST",
    body: data, // FormData para archivos — no incluir Content-Type
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
```

Los servicios:

1. Usan `fetch()` para hablar con el servidor
2. Lanzan errores con el mensaje real del backend usando `parseError`
3. Devuelven promesas con los datos tipados

## Imágenes

El campo `image` de un producto contiene solo el nombre del archivo. Para construir la URL completa se usa `IMAGE_BASE_URL` exportada desde `productService.ts`:

```typescript
import { IMAGE_BASE_URL } from '../services/productService'

// En el componente
<img src={`${IMAGE_BASE_URL}/${product.image}`} alt={product.name} />
```

## Formularios con imágenes

Cuando un formulario tiene imagen, usar `FormData` en vez de JSON:

```typescript
const formData = new FormData();
formData.append("name", product.name);
formData.append("price", String(product.price));
formData.append("stock", String(product.stock));
if (product.image) formData.append("image", product.image);

await createProduct(formData);
```

**Importante**: No incluir el header `Content-Type`. El navegador lo agrega automáticamente como `multipart/form-data` cuando se usa `FormData`.

## Manejo de errores

El backend devuelve errores en este formato:

```json
{ "message": "El nombre es requerido" }
```

Los servicios los capturan con `parseError` y los lanzan como errores normales. Las páginas los muestran con `ErrorBanner`:

```typescript
try {
  await createProduct(data);
} catch (error: any) {
  setError(error.message); // Muestra el mensaje real del backend
}
```

## Búsqueda y filtros

La forma de buscar depende:

**Búsqueda local** (en el cliente):

```typescript
const filtered = products.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase()),
);
```

**Búsqueda en el servidor** (con debounce):

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    getProducts({ search }).then(setProducts);
  }, 300); // Espera 300ms sin escribir antes de buscar
  return () => clearTimeout(timer);
}, [search]);
```

**Filtro por categoría** (en URL):

```typescript
getProducts({ search, categoryId: 1 });
// Hace: GET /api/products?search=algo&categoryId=1
```

## ¿React Router?

**Actualmente no usamos React Router**. La navegación es simple con `useState` en `App.tsx`:

```typescript
const [page, setPage] = useState("products");

// En el navegador:
{page === "products" && <ProductsPage />}
{page === "categories" && <CategoriesPage />}
{page === "sales" && <SalesPage />}
```

Si el proyecto crece a muchas más páginas, se recomienda evaluar agregar React Router.
