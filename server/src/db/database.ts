import Database from "better-sqlite3";
import { DB_PATH } from "../paths.js";

const db = new Database(DB_PATH);

// WAL mejora el rendimiento en lecturas concurrentes
db.pragma("journal_mode = WAL");

// SQLite desactiva las foreign keys por defecto, así que se debe activar manualmente
db.pragma("foreign_keys = ON");

export default db;
