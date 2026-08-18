# Instalación y ejecución

## Requisitos previos

- **Node.js 20 o superior** (descargar de [nodejs.org](https://nodejs.org))
- **Visual Studio Code** u otro editor.

## Paso 1: Clonar o descargar el proyecto

```bash
cd (ruta de preferencia)
git clone <url-del-repositorio>
cd inventario
```

Si el proyecto ya está descargado, solo abrir la carpeta en el editor.

## Paso 2: Instalar dependencias

El proyecto está separado en tres partes independientes, cada una con sus dependencias. Es necesario instalarlas:

```bash
# Instalar dependencias de la raíz del proyecto
npm install

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install

# Volver a la raíz
cd ..
```

Esto descargará todas las librerías necesarias para hacer funcionar el proyecto (React, Express, etc).

## Antes de ejecutar ⚠️: `better-sqlite3` y Electron

`better-sqlite3` es un módulo nativo (compilado). Electron (que permite empaquetar el sistema en una app de escritorio) trae su propio Node.js interno, distinto al del sistema, así que el binario compilado para uno **no sirve para el otro**. Si alternas entre correr el server suelto y correr la app empaquetada, es necesario recompilar según el caso:

```bash
cd server
npm rebuild better-sqlite3
#Este es el comando que debería usarse para trabajar en el entorno de desarrolllo
```

Para volver a Electron, ejecutar en la **raíz del proyecto**:

```bash
npm run rebuild:sqlite
```

Si aparece un error tipo `NODE_MODULE_VERSION ... requiere ...`, es esto — no es un bug, hay que recompilar para el entorno que se está usando.

## Paso 3: Ejecutar el proyecto

Una vez usado el comando para recompilar, desde la raíz del proyecto correr:

```bash
npm run dev
```

En la consola aparecerá algo como:

```
> npm run dev
> concurrently "npm run dev:server" "npm run dev:client"

[1] > server dev
[1] Servidor corriendo en http://localhost:3000
[0] > client dev
[0] Local: http://localhost:5173
```

Esto inicia dos servidores simultáneamente:

| Servicio     | URL                     | Qué es                            |
| ------------ | ----------------------- | --------------------------------- |
| **Backend**  | `http://localhost:3000` | El servidor que procesa los datos |
| **Frontend** | `http://localhost:5173` | La interfaz                       |

La base de datos `inventario.db` se crea automáticamente en la raíz del proyecto la primera vez que se inicia el servidor.

## Paso 4: Verificar que funciona

Abrir el navegador e ir a `http://localhost:5173`. Debería aparecer la interfaz del inventario.

## Correr solo frontend o backend

```bash
# Solo backend
npm run dev:server

# Solo frontend
npm run dev:client
```

## Solucionar problemas

### "Port 3000 already in use"

Otro programa está usando el puerto. Dos opciones:

- Cerrar el programa que lo está usando
- Cambiar el puerto en `server/.env` (para el 3000) o en `client/vite.config.ts` (para el 5173)

### "Module not found"

Ejecutar nuevamente: `npm install` en la carpeta que falla.

```bash
cd server && npm install
# o
cd client && npm install
```

### "better-sqlite3 error" en Windows

Se necesita recompilar un módulo nativo para el entorno actual. Desde la raíz ejecutar:

```bash
npm run rebuild:sqlite
```

Esto requiere tener **Visual Studio Build Tools** instalado con el componente **"Desarrollo de escritorio con C++"**. Si no está instalado:

1. Descargar desde [visualstudio.microsoft.com/visual-cpp-build-tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Durante la instalación marcar únicamente **"Desarrollo de escritorio con C++"**
3. Volver a correr `npm run rebuild:sqlite`
