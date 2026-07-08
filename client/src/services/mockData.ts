import type { Category } from "../types";

/**
 * Datos de prueba para desarrollar el frontend sin depender de la API real.
 * TEMPORAL: este archivo se eliminará cuando la API de categorías esté lista.
 */
export const mockCategories: Category[] = [
  {
    id: 1,
    name: "Electrónica",
    description: "Dispositivos y accesorios electrónicos",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Ropa",
    description: "Prendas de vestir para todas las edades",
    created_at: "2026-01-16T09:30:00Z",
    updated_at: "2026-01-16T09:30:00Z",
  },
  {
    id: 3,
    name: "Hogar",
    description: "Artículos para el hogar y decoración",
    created_at: "2026-01-17T14:20:00Z",
    updated_at: "2026-01-17T14:20:00Z",
  },
];