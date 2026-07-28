import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "../../inventario.db"));

// WAL mejora el rendimiento en lecturas concurrentes
db.pragma("journal_mode = WAL");

// SQLite desactiva las foreign keys por defecto, así que se debe activar manualmente
db.pragma("foreign_keys = ON");

export default db;
