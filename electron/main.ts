import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_URL = "http://localhost:3000";

let mainWindow: BrowserWindow;

function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "server", "dist", "index.js");
  }
  return path.join(__dirname, "../../server/dist/index.js");
}

async function waitForServer(url: string, timeoutMs = 20000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // El servidor aún no responde; seguimos intentando.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`El servidor no respondió en ${url}`);
}

async function startServer() {
  try {
      // El server lee USER_DATA_PATH (vía server/src/paths.ts) para saber dónde
    // guardar la base de datos y las imágenes. Tiene que quedar seteada ANTES
    // de importar el server, porque paths.ts la lee en su nivel superior.
    process.env.USER_DATA_PATH = app.getPath("userData");
    
    const serverPath = getServerPath();
    const serverUrl = new URL(`file:///${serverPath.replace(/\\/g, "/")}`);
    await import(serverUrl.href);
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  try {
    await waitForServer(SERVER_URL);
    await mainWindow.loadURL(SERVER_URL);
  } catch (error) {
    console.error("Error al cargar la aplicacion:", error);
    await mainWindow.loadURL(
      "data:text/html,<html><body><h1>Inventario</h1><p>No se pudo conectar con el backend.</p></body></html>",
    );
  }

  mainWindow.on("closed", () => {
    app.quit();
  });
}

app.whenReady().then(async () => {
  await startServer();
  void createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
