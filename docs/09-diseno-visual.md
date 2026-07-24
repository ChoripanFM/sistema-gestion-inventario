# Diseño visual

El diseño está inspirado en paneles tipo dashboard modernos: sidebar oscuro, tarjetas redondeadas y badges de estado en pastilla. Se simplificó para el alcance real del proyecto manteniendo una identidad visual clara y consistente.

## Paleta de colores

Definida como variables CSS en `client/src/index.css` usando `@theme` de Tailwind CSS v4.

| Token     | Hex       | Uso                                          |
| --------- | --------- | -------------------------------------------- |
| `navy`    | `#16324f` | Sidebar                                      |
| `bg`      | `#eaf2f6` | Fondo general                                |
| `surface` | `#ffffff` | Tarjetas y tablas                            |
| `ink`     | `#1f2937` | Texto principal                              |
| `muted`   | `#64748b` | Texto secundario                             |
| `accent`  | `#0ea5a5` | Elementos activos (nav seleccionada, avatar) |
| `line`    | —         | Bordes y separadores                         |
| `success` | `#22c55e` | Badge "En stock"                             |
| `danger`  | `#ef4444` | Badge "Stock bajo"                           |

## Tipografía

| Variable       | Fuente  | Peso            | Uso                            |
| -------------- | ------- | --------------- | ------------------------------ |
| `font-display` | Poppins | 600 / 700       | Títulos y elementos destacados |
| `font-body`    | Inter   | 400 / 500 / 600 | Texto general                  |

Ambas fuentes se importan desde Google Fonts.

## Implementación con Tailwind CSS v4

Los tokens se definen en `index.css` usando la directiva `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-navy: #16324f;
  --color-bg: #eaf2f6;
  --color-surface: #ffffff;
  --color-ink: #1f2937;
  --color-muted: #64748b;
  --color-accent: #0ea5a5;
  --color-success: #22c55e;
  --color-danger: #ef4444;

  --font-display: "Poppins", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

Esto genera automáticamente las clases de utilidad de Tailwind, por lo que no se necesita de `tailwind.config.js`:

```html
bg-navy → background-color: #16324f text-accent → color: #0ea5a5 font-display →
font-family: "Poppins", sans-serif bg-danger/15 → background-color: #ef4444 con
15% de opacidad
```

## Elementos distintivos

### Tarjetas y tablas

Esquinas muy redondeadas (`rounded-3xl`) en todos los contenedores principales.

### Badge de stock

Pastilla con punto de color que indica el estado del stock de un producto:

```tsx
// Stock normal (stock > 5)
<span className="bg-success/15 text-success">
  <span className="w-1.5 h-1.5 rounded-full bg-success" />
  En stock (10)
</span>

// Stock bajo (stock <= 5)
<span className="bg-danger/15 text-danger">
  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
  Stock bajo (3)
</span>
```

El umbral de stock bajo es `stock <= 5`.

### Avatar de categoría

Círculo con la inicial del nombre de la categoría. El color de fondo rota entre una paleta predefinida según el índice de la categoría en la lista:

```tsx
const avatarColors = [
  "bg-accent/20 text-accent",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  // ...
];
const color = avatarColors[index % avatarColors.length];
```

### Íconos

Todos los íconos provienen de `lucide-react`. Se usan principalmente en:

- Navegación del sidebar
- Acciones de tabla (editar, eliminar)
- Inputs de búsqueda
- Modales y banners de error

## Convenciones de estilo

- Todos los estilos se aplican directamente con clases de Tailwind en el JSX
- No se usan archivos CSS adicionales salvo `index.css` para los tokens globales
- Las opacidades se aplican con la sintaxis de Tailwind v4: `bg-danger/15`, `bg-black/40`
- Los estados hover se definen inline: `hover:bg-accent/10 hover:text-accent`
