import type { SaleItem } from "../types";

const API_URL = "http://localhost:3000/api/sales";

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
 * Envía el carrito de venta al backend. El backend valida stock,
 * duplicados y cantidades, y descuenta el stock si todo es correcto.
 * No devuelve un objeto de venta: solo confirma éxito o lanza el error.
 */
export async function processSale(items: SaleItem[]): Promise<void> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  if (!response.ok) return parseError(response, "Error al procesar la venta");
}