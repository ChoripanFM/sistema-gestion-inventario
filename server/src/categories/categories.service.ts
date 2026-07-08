import { categoriesRepository } from "./categories.repository.js";

export const categoriesService = {
  getAll() {
    return categoriesRepository.findAll();
  },

  getById(id: number) {
    return categoriesRepository.findById(id);
  },

  create(name: string, description?: string) {
    return categoriesRepository.create(name, description);
  },

  update(id: number, name: string, description?: string) {
    return categoriesRepository.update(id, name, description);
  },

  delete(id: number) {
    return categoriesRepository.delete(id);
  },
};
