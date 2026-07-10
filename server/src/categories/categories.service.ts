import { categoriesRepository } from "./categories.repository.js";
import { AppError } from "../errors/AppError.js";

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
    return categoriesRepository.create(name, description);
  },

  update(id: number, name: string, description?: string) {
    if (!name?.trim()) throw new AppError("El nombre es requerido", 400);
    const category = categoriesRepository.findById(id);
    if (!category) throw new AppError("Categoría no encontrada", 404);
    return categoriesRepository.update(id, name, description);
  },

  delete(id: number) {
    const category = categoriesRepository.findById(id);
    if (!category) throw new AppError("Categoría no encontrada", 404);
    return categoriesRepository.delete(id);
  },
};
