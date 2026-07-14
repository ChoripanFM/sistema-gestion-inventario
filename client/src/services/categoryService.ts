import type { Category, CategoryInput } from "../types";

const API_URL = "http://localhost:3000/api/categories";

async function parseError(response: Response, fallback: string): Promise<never> {
  try {
    const body = await response.json();
    throw new Error(body.message ?? fallback);
  } catch {
    throw new Error(fallback);
  }
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(API_URL);
  if (!response.ok) return parseError(response, "Error al obtener categorías");
  return response.json();
}

/**
 * Obtiene una categoría específica por ID.
 */
export async function getCategoryById(id: number): Promise<Category> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) return parseError(response, `Error al obtener la categoría ${id}`);
  return response.json();
}
/**
 * Crea una nueva categoría.
 */
export async function createCategory(data: CategoryInput): Promise<Category> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) return parseError(response, "Error al crear la categoría");
  return response.json();
}

/**
 * Actualiza una categoría existente.
 */
export async function updateCategory(
  id: number,
  data: CategoryInput
): Promise<Category> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) return parseError(response, `Error al actualizar la categoría ${id}`);
  return response.json();
}

/**
 * Elimina una categoría.
 */
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE", });

  if (!response.ok) return parseError(response, `Error al eliminar la categoría ${id}`);
}