# Cómo correr el proyecto

**Importante tener instalado Node.js 20 o superior.**

## Instalación de dependencias

El proyecto tiene tres `package.json` independientes. Hay que instalar las dependencias en cada uno:

```bash
# Dependencias de la raíz
npm install

# Dependencias del servidor
cd server
npm install

# Dependencias del cliente
cd ../client
npm install

# Volver a la raíz
cd ..
```

## Correr el proyecto

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto levanta ambos servidores al mismo tiempo usando `concurrently`:

| Servicio          | URL                     |
| ----------------- | ----------------------- |
| Backend (Express) | `http://localhost:3000` |
| Frontend (React)  | `http://localhost:5173` |

La base de datos `inventario.db` se crea automáticamente en la raíz del proyecto la primera vez que se inicia el servidor.

> **¿Por qué concurrently?** El script `npm run dev:server & npm run dev:client` funciona en Linux y Mac, pero se comporta distinto dependiendo del sistema operativo y la terminal en Windows. `concurrently` resuelve eso para que funcione en todos los sistemas.

## Correr solo el servidor o el cliente

```bash
# Solo el servidor
npm run dev:server

# Solo el cliente
npm run dev:client
```

## Verificar que todo funciona

1. Abrir `http://localhost:5173` en el navegador — debe aparecer la interfaz del inventario
2. Abrir `http://localhost:3000/api/categories` — debe responder `[]`
