import db from "../db/database.js";

export const productsRepository = {
  findAll(search?: string, categoryId?: number) {
    let query = "SELECT * FROM products WHERE 1=1";
    const params: (string | number)[] = [];

    if (search) {
      query += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    if (categoryId) {
      query += " AND category_id = ?";
      params.push(categoryId);
    }

    return db.prepare(query).all(...params);
  },

  findById(id: number) {
    return db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  },

  create(data: {
    name: string;
    description?: string;
    sku?: string;
    price: number;
    stock: number;
    category_id: number;
  }) {
    return db
      .prepare(
        `
      INSERT INTO products (name, description, sku, price, stock, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        data.name,
        data.description ?? null,
        data.sku ?? null,
        data.price,
        data.stock,
        data.category_id,
      );
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
    return db
      .prepare(
        `
      UPDATE products
      SET name = ?, description = ?, sku = ?, price = ?, stock = ?, category_id = ?
      WHERE id = ?
    `,
      )
      .run(
        data.name,
        data.description ?? null,
        data.sku ?? null,
        data.price,
        data.stock,
        data.category_id,
        id,
      );
  },

  delete(id: number) {
    return db.prepare("DELETE FROM products WHERE id = ?").run(id);
  },
};
