import db from "../db/database.js";

export const salesRepository = {
  findProductById(id: number) {
    return db.prepare("SELECT id, stock FROM products WHERE id = ?").get(id);
  },

  decreaseStock(items: { product_id: number; quantity: number }[]) {
    const update = db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ?",
    );

    const transaction = db.transaction(() => {
      for (const item of items) {
        update.run(item.quantity, item.product_id);
      }
    });

    transaction();
  },
};
