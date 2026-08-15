import db from "../db/database.js";

type SaleItemInput = {
  product_id: number;
  quantity: number;
};

type ProductStock = {
  id: number;
  stock: number;
};

type ProductDetails = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export const salesRepository = {
  findProductById(id: number): ProductStock | undefined {
    return db.prepare("SELECT id, stock FROM products WHERE id = ?").get(id) as ProductStock | undefined;
  },

  findProductDetailsById(id: number): ProductDetails | undefined {
    return db
      .prepare(`
        SELECT id, name, price, stock
        FROM products
        WHERE id = ?
      `)
      .get(id) as ProductDetails | undefined;
  },

  createSale(items: SaleItemInput[]) {
    const insertSale = db.prepare(`
      INSERT INTO sales (total)
      VALUES (?)
    `);

    const insertSaleItem = db.prepare(`
      INSERT INTO sale_items (
        sale_id,
        product_id,
        product_name,
        quantity,
        unit_price
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare(`
      UPDATE products
      SET stock = stock - ?
      WHERE id = ?
    `);

    const transaction = db.transaction(() => {
      let total = 0;

      const products = items.map((item) => {
        const product = this.findProductDetailsById(item.product_id);

        if (!product) {
          throw new Error(
            `Producto con ID ${item.product_id} no encontrado.`,
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para el producto "${product.name}". Stock disponible: ${product.stock}, cantidad solicitada: ${item.quantity}.`,
          );
        }

        total += product.price * item.quantity;

        return {
          item,
          product,
        };
      });

      const saleResult = insertSale.run(total);

      const saleId = Number(saleResult.lastInsertRowid);
   

      for (const { item, product } of products) {
        insertSaleItem.run(
          saleId,
          item.product_id,
          product.name,
          item.quantity,
          product.price
        );  

        updateStock.run(item.quantity, item.product_id);
      }

      return {
        saleId,
        total,
      };
    });

    return transaction();
  },

  getHistory() {
    const totalResult = db
      .prepare(`
        SELECT
          COALESCE(SUM(total), 0) AS totalSales,
          COUNT(*) AS salesCount
        FROM sales
        WHERE date(created_at) = date('now', 'localtime')
      `)
      .get() as {
        totalSales: number;
        salesCount: number;
      };

    const products = db
      .prepare(`
        SELECT
          sale_items.product_id AS productId,
          sale_items.product_name AS productName,
          SUM(sale_items.quantity) AS quantity
        FROM sale_items
        INNER JOIN sales
          ON sales.id = sale_items.sale_id
        WHERE date(sales.created_at) = date('now', 'localtime')
        GROUP BY
          sale_items.product_id,
          sale_items.product_name
        ORDER BY quantity DESC
      `)
      .all() as {
        productId: number | null;
        productName: string;
        quantity: number;
      }[];

    return {
      date: new Date().toISOString().slice(0, 10),
      totalSales: totalResult.totalSales,
      salesCount: totalResult.salesCount,
      products,
    };
  },

};
