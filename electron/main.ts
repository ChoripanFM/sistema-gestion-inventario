import { app, BrowserWindow } from "electron";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess: ChildProcess;
let mainWindow: BrowserWindow;

function startServer() {
  const serverPath = path.join(__dirname, "../server/dist/index.js");
  serverProcess = spawn("node", [serverPath], {
    env: { ...process.env, PORT: "3000" },
  });

  serverProcess.stdout?.on("data", (data) => {
    console.log(`Servidor: ${data}`);
  });

  serverProcess.stderr?.on("data", (data) => {
    console.error(`Error servidor: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Espera a que el servidor esté listo
  setTimeout(() => {
    mainWindow.loadURL("http://localhost:3000");
  }, 2000);

  mainWindow.on("closed", () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
