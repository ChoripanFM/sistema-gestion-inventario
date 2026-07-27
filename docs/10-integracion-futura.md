# Integración futura

El sistema de inventario está diseñado para integrarse a futuro con un catálogo web.

## Cómo funciona la integración

El inventario seguirá funcionando de forma local y offline como hasta ahora. La integración consiste en exponer una parte de la API al exterior para que el catálogo web pueda consumirla.

```
Inventario local (privado)          Catálogo web (público)
        │                                    │
        ▼                                    ▼
/api/products                    /api/public/products
  todos los campos                 solo campos públicos
  incluye stock interno            solo productos visibles
```

## Cambios necesarios en el backend

### 1. Agregar campo `visible` a productos

Permite controlar qué productos aparecen en el catálogo sin tener que eliminarlos del inventario.

```sql
ALTER TABLE products ADD COLUMN visible INTEGER NOT NULL DEFAULT 1;
```

```
visible = 1 → el producto aparece en el catálogo web
visible = 0 → el producto existe en el inventario pero no se muestra en la web
```

### 2. Agregar campo `slug` a productos y categorías

Permite construir URLs amigables en el catálogo web.

```sql
ALTER TABLE products ADD COLUMN slug TEXT UNIQUE;
ALTER TABLE categories ADD COLUMN slug TEXT UNIQUE;
```

Ejemplo: el producto "Rasperry Pi" tendría el slug `rasperry-pi` y su URL en el catálogo sería `/productos/rasperry-pi`.

### 3. Crear endpoint público

Un nuevo router `/api/public` que exponga solo los datos necesarios para el catálogo:

```ts
// server/src/public/public.router.ts
router.get("/products", publicController.getProducts);
router.get("/products/:slug", publicController.getProductBySlug);
router.get("/categories", publicController.getCategories);
```

Este endpoint devuelve solo productos con `visible = 1` y solo los campos públicos (sin stock interno, por ejemplo).

```ts
// Ejemplo de respuesta pública
{
  "id": 1,
  "name": "Rasperry Pi",
  "slug": "rasperry-pi",
  "description": "...",
  "price": 80000,
  "image": "1234567890-imagen.jpg",
  "category": {
    "id": 1,
    "name": "Electrónica",
    "slug": "electronica"
  }
}
```

### 4. Configurar CORS para el catálogo web

Actualizar la configuración de CORS en `index.ts` para permitir peticiones desde la URL del catálogo web:

```ts
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL, // frontend del inventario (local)
      process.env.CATALOG_URL, // catálogo web (público)
    ],
  }),
);
```

```
CATALOG_URL=https://www.tu-catalogo.cl
```

## Cambios necesarios en el frontend del inventario

### Toggle de visibilidad en productos

Agregar un control en el formulario de producto que permita marcar si el producto es visible en el catálogo:

```tsx
<label>
  <input type="checkbox" name="visible" defaultChecked />
  Mostrar en catálogo web
</label>
```

### Indicador visual en la tabla

Agregar un badge o ícono en la tabla de productos que indique si el producto es visible o no en el catálogo, para que el usuario pueda identificarlo rápidamente.

## Arquitectura de despliegue sugerida

```
Red local
┌─────────────────────────────────────┐
│  Inventario (privado)               │
│  ├── Frontend React (puerto 5173)   │
│  └── Backend Express (puerto 3000)  │
└─────────────────────────────────────┘
            │
            │ Solo /api/public expuesto al exterior
            │ (mediante Nginx o similar)
            ▼
      Internet
┌─────────────────────┐
│  Catálogo web       │
│  (sitio público)    │
└─────────────────────┘
```

El backend Express se mantiene en la red local. Solo el endpoint `/api/public` se expone al exterior mediante un proxy inverso como Nginx, lo que protege los datos internos del inventario.

## Orden de implementación sugerido

1. Agregar campo `visible` y `slug` al schema de la base de datos
2. Actualizar el formulario de productos para manejar `visible`
3. Crear el módulo `public/` en el backend con su router, controller y service
4. Configurar Nginx para exponer solo `/api/public` y `/uploads` al exterior
5. Construir el catálogo web como proyecto separado que consuma `/api/public`
