# Respaldo de datos

## Descripción general

El sistema incluye una funcionalidad de respaldo del inventario para exportar una copia segura de la base de datos SQLite junto con las imágenes almacenadas en el servidor.

Este respaldo se genera en el backend y se descarga desde la interfaz del historial.

## Qué incluye el respaldo

El archivo generado es un ZIP que contiene:

- `inventario.db`: una copia instantánea de la base de datos SQLite actual
- `uploads/`: la carpeta con las imágenes del inventario

Esto permite restaurar tanto el estado de los productos, categorías y ventas como los archivos visuales asociados.

## Generación del respaldo

El endpoint del backend crea una snapshot de la base de datos usando SQLite `backup()` y luego comprime ambos elementos en un ZIP temporal.

### Endpoint

```
GET /api/backup
```

### Proceso

1. Verifica que exista la carpeta de imágenes del inventario
2. Crea un directorio temporal en el sistema
3. Guarda una copia de la base de datos en ese directorio
4. Comprime la base de datos y la carpeta `uploads` en un archivo ZIP
5. Devuelve el archivo al cliente con el nombre apropiado
6. Elimina el archivo temporal una vez que la descarga termina

## Nombre del archivo

El nombre de respaldo se genera dinámicamente con fecha y hora:

```text
respaldo-inventario-2026-08-18-153025.zip
```

Formato:

- `respaldo-inventario-`
- año
- mes
- día
- hora, minutos y segundos

Esto hace que cada descarga quede identificada y no se sobrescriba con otra copia.

## Cabecera `Content-Disposition`

El backend expone la cabecera `Content-Disposition` para que el navegador conserve el nombre real del archivo al descargarlo.

Esto permite que la descarga no se llame genéricamente como `download` o `archivo.zip`, sino con el nombre generado por el sistema.

## Descarga desde el frontend

La interfaz incluye un botón en la página de historial:

- `Descargar respaldo`
- Muestra estado de carga mientras se genera el archivo
- Muestra un error si la descarga falla

El servicio del frontend hace la petición al backend y, al recibir la respuesta, crea un enlace temporal para descargar el ZIP con el nombre correcto.

## Manejo de estados

Durante la descarga se manejan dos estados principales:

- `backupLoading`: indica que se está generando el archivo
- `backupError`: informa si ocurrió un problema al solicitar o guardar el respaldo

Esto mejora la experiencia de usuario y evita que el usuario crea que la acción no respondió.

## Consideraciones

- El respaldo incluye la base de datos y las imágenes, no solo los registros
- Los archivos temporales se eliminan después de la descarga
- Si la carpeta `uploads` no existe, la operación falla con un error claro

## Ubicación de los datos en Windows

En la aplicación empaquetada, la base de datos y las imágenes se guardan fuera
de la carpeta de instalación, en la carpeta de datos de usuario de Electron:

```text
%APPDATA%\Inventario\
```

La ruta completa suele ser:

```text
C:\Users\<usuario>\AppData\Roaming\Inventario\
```

Dentro de esta carpeta se encuentran:

```text
inventario.db
uploads\
```

## Restaurar un respaldo

1. Cierra la aplicación Inventario.
2. Abre el archivo ZIP del respaldo.
3. Copia `inventario.db` a `%APPDATA%\Inventario\` y reemplaza el archivo existente.
4. Copia la carpeta `uploads` a `%APPDATA%\Inventario\` y combina o reemplaza los archivos existentes.
5. Abre nuevamente la aplicación y verifica los productos y sus imágenes.
