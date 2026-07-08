import { productsRepository } from "./products.repository.js";
import { categoriesRepository } from "../categories/categories.repository.js";

export const productsService = {
  getAll(search?: string, categoryId?: number) {
    return productsRepository.findAll(search, categoryId);
  },

  getById(id: number) {
    return productsRepository.findById(id);
  },

  create(data: {
    name: string;
    description?: string;
    sku?: string;
    price: number;
    stock: number;
    category_id: number;
  }) {
    const category = categoriesRepository.findById(data.category_id);
    if (!category) {
      throw new Error("Categoría no encontrada");
    }
    return productsRepository.create(data);
  },

  update(
    id: number,
    data: {
      name: string;
      description?: string;
      sku?: string;
      price: number;
      stock: number;
      category_id: number;
    },
  ) {
    return productsRepository.update(id, data);
  },

  delete(id: number) {
    return productsRepository.delete(id);
  },
};
