import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Directorio base donde persisten los datos del usuario: la base de datos
 * SQLite y las imágenes subidas de productos.
 *
 * - Cuando el server corre embebido en Electron (empaquetado o vía
 *   `npm run electron`), electron/main.ts define la variable de entorno
 *   USER_DATA_PATH con app.getPath("userData") ANTES de importar este
 *   módulo. Esa carpeta la administra el sistema operativo (por ejemplo
 *   `%APPDATA%/Inventario` en Windows), persiste entre reinstalaciones y
 *   actualizaciones de la app, y no requiere permisos de administrador.
 * - Si la variable no está definida (por ejemplo al correr el server
 *   suelto con `npm run dev:server` o `node dist/index.js` para pruebas),
 *   se usa la carpeta `server/` del proyecto — el comportamiento histórico.
 */
const baseDataDir = process.env.USER_DATA_PATH ?? path.join(__dirname, "..");

export const DB_PATH = path.join(baseDataDir, "inventario.db");
export const UPLOADS_PATH = path.join(baseDataDir, "uploads");

// En una instalación nueva de Electron, la carpeta userData empieza vacía:
// hay que crear uploads/ antes de que multer o el backup intenten usarla.
// En modo desarrollo la carpeta ya existe (versionada con server/uploads/.gitkeep),
// así que esto es un no-op seguro.
fs.mkdirSync(UPLOADS_PATH, { recursive: true });