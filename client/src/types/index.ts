/**
 * Representa una categoría de productos.
 * Refleja la tabla `categories`(puede cambiar a categoría) definida en el backend (schema.ts).
 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Representa un producto del inventario.
 * Refleja la tabla `products` definida en el backend (schema.ts).
 */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  stock: number;
  category_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Forma de los datos que se envían al crear/editar una categoría.
 * No incluye id ni timestamps porque los genera el backend.
 */
export interface CategoryInput {
  name: string;
  description?: string;
}

/**
 * Forma de los datos que se envían al crear/editar un producto.
 */
export interface ProductInput {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock: number;
  category_id: number;
}