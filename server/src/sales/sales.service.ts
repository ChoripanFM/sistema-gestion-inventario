import { salesRepository } from "./sales.repository.js";
import { AppError } from "../errors/AppError.js";

interface SaleItem {
  product_id: number;
  quantity: number;
}

export const salesService = {
  process(items: SaleItem[]) {
    if (!items?.length) throw new AppError("El carrito está vacío", 400);

    // Valida que todos los productos existen y tienen stock suficiente
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new AppError("La cantidad debe ser mayor a cero", 400);
      }

      const product = salesRepository.findProductById(item.product_id) as any;
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

    // Descontar stock en una transacción
    salesRepository.decreaseStock(items);
  },
};
