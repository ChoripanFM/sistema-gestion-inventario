import type { Category, CategoryInput } from "../types";

const API_URL = "http://localhost:3000/api/categories";
/**
 * Obtiene todas las categorías desde la API.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Error al obtener categorías: ${response.status}`);
  }

  return response.json();
}

/**
 * Obtiene una categoría específica por ID.
 */
export async function getCategoryById(id: number): Promise<Category> {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Error al obtener la categoría ${id}: ${response.status}`);
  }

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

  if (!response.ok) {
    throw new Error(`Error al crear la categoría: ${response.status}`);
  }

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

  if (!response.ok) {
    throw new Error(`Error al actualizar la categoría ${id}: ${response.status}`);
  }

  return response.json();
}

/**
 * Elimina una categoría.
 */
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar la categoría ${id}: ${response.status}`);
  }
}