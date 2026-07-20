import type { Product, ProductInput } from "../types";

const API_URL = "http://localhost:3000/api/products";
export const IMAGE_BASE_URL = "http://localhost:3000/uploads";

async function parseError(
  response: Response,
  fallback: string,
): Promise<never> {
  let message = fallback;
  try {
    const body = await response.json();
    if (body?.message) message = body.message;
  } catch (parseErr) {
    console.warn(
      "No se pudo interpretar el cuerpo del error como JSON:",
      parseErr,
    );
  }
  throw new Error(message);
}

function buildFormData(data: ProductInput, imageFile?: File | null): FormData {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.sku) formData.append("sku", data.sku);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  if (data.category_id !== null && data.category_id !== undefined) {
    formData.append("category_id", String(data.category_id));
  }
  if (imageFile) formData.append("image", imageFile);
  return formData;
}

export async function getProducts(params?: {
  search?: string;
  categoryId?: number;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("categoryId", String(params.categoryId));

  const url = query.toString() ? `${API_URL}?${query}` : API_URL;
  const response = await fetch(url);
  if (!response.ok) return parseError(response, "Error al obtener productos");
  return response.json();
}

export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok)
    return parseError(response, `Error al obtener el producto ${id}`);
  return response.json();
}

export async function createProduct(
  data: ProductInput,
  imageFile?: File | null,
): Promise<Product> {
  const response = await fetch(API_URL, {
    method: "POST",
    body: buildFormData(data, imageFile),
  });

  if (!response.ok) return parseError(response, `Error al crear el producto`);
  return response.json();
}

export async function updateProduct(
  id: number,
  data: ProductInput,
  imageFile?: File | null,
): Promise<Product> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: buildFormData(data, imageFile),
  });
  if (!response.ok)
    return parseError(response, `Error al actualizar el producto ${id}`);
  return response.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok)
    return parseError(response, `Error al eliminar el producto ${id}`);
}
