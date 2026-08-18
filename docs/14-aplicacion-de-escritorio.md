# Aplicación de escritorio

## Uso de Electron

Se utiliza Electron para empaquetar el sistema como una aplicación de escritorio para Windows. El usuario instala un `.exe` y abre la app con doble click, sin necesidad de instalar Node.js ni usar comandos.

## Cómo funciona

Electron actúa como contenedor que:

1. Importa el servidor Express directamente en su proceso
2. Espera a que el servidor esté listo
3. Abre una ventana que carga `http://localhost:3000`

El frontend React se sirve como archivos estáticos desde Express.

## Estructura

```
inventario/
├── electron/
│   └── main.ts         # Punto de entrada de Electron
└── package.json        # Configuración de electron-builder
```

## Consideraciones importantes antes de generar la app

### 1. better-sqlite3 requiere recompilación ⚠️⚠️⚠️

`better-sqlite3` utiliza un módulo nativo (`.node`), por lo que debe ser compatible con la versión de Node.js utilizada por Electron. Al clonar el proyecto o cambiar de entorno, puede ser necesario recompilarlo.

La recompilación utiliza `node-gyp`, por lo que requiere un compilador de C++. En este caso es necesario instalar **Visual Studio Build Tools**:

1. Descargar desde [visualstudio.microsoft.com/visual-cpp-build-tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Durante la instalación marcar únicamente **"Desarrollo de escritorio con C++"**

Una vez terminada la instalación, ejecutar en la **raíz del proyecto**:

```bash
npm run rebuild:sqlite
```

Sin este paso, el servidor falla al intentar conectarse a SQLite.

### 2. Rutas según el entorno

Las rutas del servidor son distintas en desarrollo y en producción. Se usa `app.isPackaged` para distinguirlas:

```ts
function getServerPath() {
  if (app.isPackaged) {
    // En producción los archivos están en resources/
    return path.join(process.resourcesPath, "server", "dist", "index.js");
  }
  // En desarrollo están en la carpeta del proyecto
  return path.join(__dirname, "../server/dist/index.js");
}
```

### 3. Importar el servidor con file://

El servidor se importa dinámicamente. En Windows las rutas absolutas deben convertirse a URLs con `file://`:

```ts
const serverUrl = new URL(`file:///${serverPath.replace(/\\/g, "/")}`);
await import(serverUrl.href);
```

### 4. Esperar a que el servidor esté listo

El servidor tarda un momento en arrancar. `waitForServer` reintenta la conexión cada 250ms hasta que responde o se agota el tiempo:

```ts
async function waitForServer(url: string, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`El servidor no respondió en ${url}`);
}
```

### 5. extraResources en electron-builder

Los archivos del servidor y el frontend deben estar **fuera del archivo `.asar`** para que Node.js pueda importarlos correctamente. Se usa `extraResources` en `package.json`:

```json
"extraResources": [
  { "from": "server/dist", "to": "server/dist" },
  { "from": "server/node_modules", "to": "server/node_modules" },
  { "from": "client/dist", "to": "client/dist" }
]
```

Sin esto, el servidor no encuentra sus archivos al arrancar y la ventana queda en blanco.

## Cómo generar el instalador

Debido a la configuración de scripts en el `packaje.json` raíz, solo se necesita ejecutar un comando para generar las carpetas dist y empaquetar la app:

```bash
npm run dist
```

Tras ejecutarlo, se generará la carpeta `release` con el instalador en su interior:

```
release/Inventario Setup 1.0.0.exe
```

De momento, ese es el único archivo que se necesita para instalar el programa. Por ejemplo, los archivos `latest.yml` y `builder-effective-config.yaml` son para actualizaciones automáticas.

## Qué hacer al actualizar la app

1. Hacer los cambios en el código
2. Correr `npm run dist`
3. Desinstalar la versión anterior e instalar el nuevo `.exe` generado.

## Problemas conocidos

| Problema                       | Causa                                   | Solución                                                                           |
| ------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------- |
| Ventana en blanco              | Servidor no arrancó o rutas incorrectas | Verificar `extraResources` y `getServerPath`                                       |
| Error de better-sqlite3        | Módulo no compilado para el entorno     | Correr `npm run rebuild:sqlite` (necesario instalar **Visual Studio Build Tools**) |
| EPERM al generar el instalador | La app está abierta en segundo plano    | Cerrar todos los procesos de Inventario y reintentar                               |
| El servidor no responde        | Timeout de `waitForServer` muy corto    | Aumentar `timeoutMs` en `waitForServer`                                            |
