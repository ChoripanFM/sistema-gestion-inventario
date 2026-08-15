import archiver from "archiver";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_PATH = path.join(__dirname, "../../uploads");

function getBackupName(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `respaldo-inventario-${year}-${month}-${day}-${hours}${minutes}${seconds}.zip`;
}

export async function createInventoryBackup(): Promise<{
  filePath: string;
  fileName: string;
}> {
  if (!fs.existsSync(UPLOADS_PATH)) {
    throw new Error("No se encontró la carpeta de imágenes del inventario");
  }

  const tempDirectory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "inventario-backup-"),
  );

  const tempDatabasePath = path.join(tempDirectory, "inventario.db");
  const zipPath = path.join(tempDirectory, getBackupName());

  try {
    await db.backup(tempDatabasePath);

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      output.on("close", () => {
        resolve();
      });

      output.on("error", reject);
      archive.on("error", reject);

      archive.pipe(output);

      archive.file(tempDatabasePath, {
        name: "inventario.db",
      });

      archive.directory(UPLOADS_PATH, "uploads");

      void archive.finalize();
    });

    return {
      filePath: zipPath,
      fileName: path.basename(zipPath),
    };
  } catch (error) {
    await fs.promises.rm(tempDirectory, {
      recursive: true,
      force: true,
    });

    throw error;
  }
}

export async function cleanupBackup(filePath: string): Promise<void> {
  const directory = path.dirname(filePath);

  await fs.promises.rm(directory, {
    recursive: true,
    force: true,
  });
}