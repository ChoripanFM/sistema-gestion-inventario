import type { Product, ProductInput } from "../types";

const API_URL = "http://localhost:3000/api/products";

async function parseError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const body = await response.json();
    if (body?.message) message = body.message;
  } catch (parseErr) {
    console.warn("No se pudo interpretar el cuerpo del error como JSON:", parseErr);
  }
  throw new Error(message);
}

/**
 * Obtiene todos los productos desde la API.
 */
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);
  if (!response.ok) return parseError(response, "Error al obtener productos");
  return response.json();
}

/**
 * Obtiene un producto específico por ID.
 */
export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) return parseError(response, `Error al obtener el producto ${id}`);
  return response.json();
}

/**
 * Crea un nuevo producto.
 */
export async function createProduct(data: ProductInput): Promise<Product> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) return parseError(response, `Error al crear el producto`);
  return response.json();
}

/**
 * Actualiza un producto existente.
 */
export async function updateProduct(
  id: number,
  data: ProductInput
): Promise<Product> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) return parseError(response, `Error al actualizar el producto ${id}`);
  return response.json();
}

/**
 * Elimina un producto.
 */
export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE", });
  if (!response.ok) return parseError(response, `Error al eliminar el producto ${id}`);
}