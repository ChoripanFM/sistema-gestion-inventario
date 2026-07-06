import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

console.log("Alo funciona la BD");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "../../inventario.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export default db;
