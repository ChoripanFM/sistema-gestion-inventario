import db from "../db/database.js";

export const categoriesRepository = {
  findAll() {
    return db.prepare("SELECT * FROM categories").all();
  },

  findById(id: number) {
    return db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  },

  findByName(name: string) {
    return db
      .prepare("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)")
      .get(name);
  },

  // Busca una categoría con el mismo nombre, pero ignorando la actual.
  findByNameExcludingId(name: string, excludeId: number) {
    return db
      .prepare(
        "SELECT * FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?",
      )
      .get(name, excludeId);
  },

  create(name: string, description?: string) {
    return db
      .prepare("INSERT INTO categories (name, description) VALUES (?, ?)")
      .run(name, description ?? null);
  },

  update(id: number, name: string, description?: string) {
    return db
      .prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?")
      .run(name, description ?? null, id);
  },

  delete(id: number) {
    return db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  },

  deleteWithProducts(id: number) {
    const deleteProducts = db.prepare(
      "DELETE FROM products WHERE category_id = ?",
    );
    const deleteCategory = db.prepare("DELETE FROM categories WHERE id = ?");

    // Si algo falla a mitad del proceso, ningún cambio se aplica
    const transaction = db.transaction(() => {
      deleteProducts.run(id);
      deleteCategory.run(id);
    });

    transaction();
  },
};
