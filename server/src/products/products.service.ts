import { productsRepository } from "./products.repository.js";
import { categoriesRepository } from "../categories/categories.repository.js";
import { AppError } from "../errors/AppError.js";
import { unlink } from "fs/promises";
import path from "path";
import { UPLOADS_PATH } from "../paths.js";

function validateProductData(data: { name: string; price: any; stock: any }) {
  if (!data.name?.trim()) throw new AppError("El nombre es requerido", 400);
  if (data.price === undefined)
    throw new AppError("El precio es requerido", 400);
  if (data.stock === undefined)
    throw new AppError("El stock es requerido", 400);

  const price = Number(data.price);
  const stock = Number(data.stock);

  if (isNaN(price)) throw new AppError("El precio debe ser un número", 400);
  if (isNaN(stock)) throw new AppError("El stock debe ser un número", 400);
  if (price < 0) throw new AppError("El precio no puede ser negativo", 400);
  if (stock < 0) throw new AppError("El stock no puede ser negativo", 400);

  return { price, stock };
}

export const productsService = {
  getAll(search?: string, categoryId?: number) {
    return productsRepository.findAll(search, categoryId);
  },

  getById(id: number) {
    const product = productsRepository.findById(id);
    if (!product) throw new AppError("Producto no encontrado", 404);
    return product;
  },

  create(data: {
    name: string;
    description?: string;
    sku?: string;
    price: number;
    stock: number;
    category_id?: number;
    image?: string;
  }) {
    const { price, stock } = validateProductData(data);

    if (data.category_id) {
      const category = categoriesRepository.findById(data.category_id);
      if (!category) throw new AppError("Categoría no encontrada", 404);
    }

    // Se valida antes del INSERT para devolver un mensaje de negocio.
    if (data.sku) {
      const existingSKU = productsRepository.findBySku(data.sku);
      if (existingSKU)
        throw new AppError("Ya existe un producto con este SKU", 409);
    }

    return productsRepository.create({ ...data, price, stock });
  },

  update(
    id: number,
    data: {
      name: string;
      description?: string;
      sku?: string;
      price: number;
      stock: number;
      category_id?: number;
      image?: string;
    },
  ) {
    const { price, stock } = validateProductData(data);

    const product = productsRepository.findById(id) as any;
    if (!product) throw new AppError("Producto no encontrado", 404);

    if (data.category_id) {
      const category = categoriesRepository.findById(data.category_id);
      if (!category) throw new AppError("Categoría no encontrada", 404);
    }

    if (data.sku) {
      const existingSKU = productsRepository.findBySkuExcludingId(data.sku, id);
      if (existingSKU)
        throw new AppError("Ya existe un producto con ese SKU", 409);
    }

    if (data.image && product.image) {
      const imagePath = path.join(UPLOADS_PATH, product.image);
      unlink(imagePath).catch(() => {}); // Si el archivo ya no existe, se ignora el error para no bloquear la operación
    }

    return productsRepository.update(id, { ...data, price, stock });
  },

  delete(id: number) {
    const product = productsRepository.findById(id) as any;
    if (!product) throw new AppError("Producto no encontrado", 404);

    if (product.image) {
      const imagePath = path.join(UPLOADS_PATH, product.image);
      unlink(imagePath).catch(() => {});
    }

    return productsRepository.delete(id);
  },
};
