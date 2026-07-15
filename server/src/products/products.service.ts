import { productsRepository } from "./products.repository.js";
import { categoriesRepository } from "../categories/categories.repository.js";
import { AppError } from "../errors/AppError.js";
import { unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    if (data.image && product.image) {
      // Si se sube una nueva imagen y el producto ya tiene una imagen existente
      const imagePath = path.join(__dirname, "../../uploads", product.image);
      unlink(imagePath).catch(() => {});
    }

    return productsRepository.update(id, { ...data, price, stock });
  },

  delete(id: number) {
    const product = productsRepository.findById(id) as any;
    if (!product) throw new AppError("Producto no encontrado", 404);

    if (product.image) {
      const imagePath = path.join(__dirname, "../../uploads", product.image);
      unlink(imagePath).catch(() => {}); // Ignorar errores al eliminar la imagen
    }

    return productsRepository.delete(id);
  },
};
