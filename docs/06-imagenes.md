# Imágenes

## Cómo funciona

Las imágenes se almacenan como archivos en la carpeta `server/uploads/`. En la base de datos solo se guarda el nombre del archivo, no la imagen en sí.

```
Formulario (frontend)
        │
        ▼
multer (middleware)       → recibe el archivo, lo valida y lo guarda en uploads/
        │
        ▼
Controller                → lee req.file.filename y lo pasa al service
        │
        ▼
Repository                → guarda el nombre del archivo en la columna image
        │
        ▼
Base de datos             → image = "1234567890-imagen.jpg"
```

Las imágenes se sirven como archivos estáticos desde:

```
http://localhost:3000/uploads/:filename
```

---

## Configuración de multer

La configuración se encuentra en `server/src/middlewares/upload.ts`.

**Almacenamiento:**

```ts
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
```

El nombre del archivo se genera con un timestamp más un número aleatorio para evitar conflictos.

**Validación de tipo:**

```ts
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
```

Solo se aceptan imágenes JPG, PNG y WEBP.

**Límite de tamaño:**

```ts
limits: {
  fileSize: 5 * 1024 * 1024;
} // 5MB máximo
```

---

## Flujo de subida al crear un producto

```
POST /api/products
Content-Type: multipart/form-data

1. multer procesa el archivo y lo guarda en uploads/
2. El controller lee req.file.filename
3. El service valida los datos del producto
4. El repository inserta el producto con el nombre del archivo en la columna image
```

Si no se sube imagen, `image` queda como `NULL` en la base de datos.

---

## Flujo de reemplazo al actualizar un producto

```
PUT /api/products/:id
Content-Type: multipart/form-data

1. multer guarda la nueva imagen en uploads/
2. El service obtiene el producto actual para leer su imagen anterior
3. Si el producto tenía imagen, se elimina el archivo anterior del servidor
4. El repository actualiza el producto con el nuevo nombre de archivo
```

En el SQL se usa `COALESCE` para que si no se sube imagen nueva, se mantenga la anterior:

```sql
image = COALESCE(?, image)
```

---

## Flujo de eliminación

**Al eliminar un producto:**

```
1. El service obtiene el producto para leer su imagen
2. Si tenía imagen, se elimina el archivo de uploads/
3. Se elimina el producto de la base de datos
```

**Al eliminar una categoría con `?deleteProducts=true`:**

```
1. El service obtiene todos los productos de esa categoría
2. Por cada producto con imagen, se elimina el archivo de uploads/
3. El repository ejecuta la transacción: borra productos y luego la categoría
```

En ambos casos, si el archivo ya no existe en el servidor, el error se ignora silenciosamente para no bloquear la operación:

```ts
unlink(imagePath).catch(() => {});
```

---

## Construir la URL de una imagen en el frontend

El campo `image` en la respuesta de la API contiene solo el nombre del archivo:

```json
{ "image": "1234567890-imagen.jpg" }
```

Para construir la URL completa en el frontend, se usa la constante `IMAGE_BASE_URL` definida en `productService.ts`:

```ts
export const IMAGE_BASE_URL = "http://localhost:3000/uploads";

const imageUrl = `${IMAGE_BASE_URL}/${product.image}`;
```

---

## Consideraciones

- La carpeta `uploads/` no se sube a Git. Se rastrea mediante un archivo `.gitkeep` vacío para que la carpeta exista al clonar el repositorio.
- Al clonar el proyecto en una máquina nueva, las imágenes no estarán disponibles. Es responsabilidad del usuario transferir la carpeta `uploads/` y el archivo `inventario.db` si quiere migrar los datos.
- Si se elimina manualmente un archivo de `uploads/` sin eliminarlo desde la aplicación, el producto quedará con un campo `image` apuntando a un archivo inexistente. El frontend debe manejar este caso mostrando un ícono de imagen no disponible.
