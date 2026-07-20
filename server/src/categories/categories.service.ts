import { categoriesRepository } from "./categories.repository.js";
import { productsRepository } from "../products/products.repository.js";
import { unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { AppError } from "../errors/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const categoriesService = {
  getAll() {
    return categoriesRepository.findAll();
  },

  getById(id: number) {
    const category = categoriesRepository.findById(id);
    if (!category) throw new AppError("Categoría no encontrada", 404);
    return category;
  },

  create(name: string, description?: string) {
    if (!name?.trim()) throw new AppError("El nombre es requerido", 400);

    // Validar que no exista una categoría con el mismo nombre. La búsqueda se hace directamente en la BD.
    const existingCategory = categoriesRepository.findByName(name.trim());

    if (existingCategory) {
      throw new AppError("Ya existe una categoría con este nombre.", 409);
    }

    return categoriesRepository.create(name, description);
  },

  update(id: number, name: string, description?: string) {
    if (!name?.trim()) throw new AppError("El nombre es requerido", 400);
    const category = categoriesRepository.findById(id);
    if (!category) throw new AppError("Categoría no encontrada", 404);

    const existingCategory = categoriesRepository.findByNameExcludingId(
      name.trim(),
      id,
    );

    if (existingCategory) {
      throw new AppError("Ya existe una categoría con este nombre.", 409);
    }

    return categoriesRepository.update(id, name, description);
  },

  delete(id: number, deleteProducts?: boolean) {
    const category = categoriesRepository.findById(id);
    if (!category) throw new AppError("Categoría no encontrada", 404);

    if (deleteProducts) {
      const products = productsRepository.findAll(undefined, id) as any[];
      for (const product of products) {
        if (product.image) {
          const imagePath = path.join(
            __dirname,
            "../../uploads",
            product.image,
          );
          unlink(imagePath).catch(() => {});
        }
      }
      return categoriesRepository.deleteWithProducts(id);
    }
    return categoriesRepository.delete(id);
  },
};
