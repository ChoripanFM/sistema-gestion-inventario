import { salesRepository } from "./sales.repository.js";
import { AppError } from "../errors/AppError.js";

interface SaleItem {
  product_id: number;
  quantity: number;
}

export const salesService = {
  process(items: SaleItem[]) {
    if (!items?.length) throw new AppError("El carrito está vacío", 400);

    const productIds = items.map((item) => item.product_id);
    const uniqueIds = new Set(productIds);
    if (uniqueIds.size !== productIds.length) {
      throw new AppError("El carrito tiene productos duplicados", 400);
    }

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
        throw new AppError(
          "La cantidad debe ser un número entero positivo",
          400,
        );
      }

      const product = salesRepository.findProductById(item.product_id);
      if (!product) {
        throw new AppError(
          `Producto con id ${item.product_id} no encontrado`,
          404,
        );
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Stock insuficiente para el producto con id ${item.product_id}. Stock disponible: ${product.stock}`,
          409,
        );
      }
    }

    return salesRepository.createSale(items);
  },

  getHistory() {
    return salesRepository.getHistory();
  },
};
