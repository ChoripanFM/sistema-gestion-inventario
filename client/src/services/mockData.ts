import type { Category, Product } from "../types";

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

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Audífonos Bluetooth",
    description: "Audífonos inalámbricos con cancelación de ruido",
    sku: "ELEC-001",
    price: 29990,
    stock: 15,
    category_id: 1,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-01T10:00:00Z",
  },
  {  
    id: 2,
    name: "Camiseta de Algodón",
    description: "Camiseta básica de algodón para uso diario",
    sku: "CLOTH-001",
    price: 7990,
    stock: 50,
    category_id: 2,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-01T10:00:00Z",
  },
  {
    id: 3,
    name: "Lámpara de Mesa",
    description: "Lámpara de mesa con diseño moderno y luz LED",
    sku: "HOME-001",
    price: 15990,
    stock: 20,
    category_id: 3,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-01T10:00:00Z",
  },
]