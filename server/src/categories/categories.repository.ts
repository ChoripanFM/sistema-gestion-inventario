import db from "../db/database.js";

export const categoriesRepository = {
  findAll() {
    return db.prepare("SELECT * FROM categories").all();
  },

  findById(id: number) {
    return db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
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
};
