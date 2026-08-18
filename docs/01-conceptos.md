# Conceptos básicos para empezar

## El proyecto en resumen

Sistema de gestión de inventario con:

- Gestión de productos y categorías
- Sistema de ventas con carrito
- Subida de imágenes
- Base de datos local (SQLite)
- App de escritorio Windows (Electron)

## Cómo se comunican el frontend y el backend

El frontend (React) y el backend (Express) son dos programas separados que se comunican mediante HTTP, el mismo protocolo que usa el navegador para cargar páginas web.

El estándar que se usa se llama REST, que es una forma organizada de pedirle cosas al servidor usando verbos HTTP:

```
GET    /api/products     → traer todos los productos
GET    /api/products/5   → traer el producto con id 5
POST   /api/products     → crear un nuevo producto
PUT    /api/products/5   → modificar el producto con id 5
DELETE /api/products/5   → eliminar el producto con id 5
```

**GET** = Pedir información  
**POST** = Crear
**PUT** = Modificar
**DELETE** = Eliminar

## TypeScript

El proyecto usa TypeScript tanto en el frontend como en el backend. TypeScript es JavaScript con tipos, lo que permite detectar errores antes de correr el código:

```ts
// JavaScript — no avisa si el tipo es incorrecto
function calcularTotal(precio, cantidad) {
  return precio * cantidad;
}
calcularTotal("mil", 3); // NaN — error silencioso

// TypeScript — avisa en el editor antes de correr
function calcularTotal(precio: number, cantidad: number): number {
  return precio * cantidad;
}
calcularTotal("mil", 3); // Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

Con TypeScript, si se intenta pasar un texto en lugar de un número, el editor avisa **antes** de correr el programa.

## Arquitectura del proyecto

```
┌─────────────────────┐
│   Frontend (React)  │  ← Interfaz visual
├─────────────────────┤
│  Servicios (fetch)  │  ← Comunica con el servidor (los componentes nunca hacen fetch directo. Se usan los servicios)
├─────────────────────┤
│  API REST (HTTP)    │  ← Protocolo de comunicación
├─────────────────────┤
│ Backend (Express)   │  ← Procesa las peticiones
├─────────────────────┤
│ Base de datos       │  ← Guarda la información
└─────────────────────┘
```

### El backend sigue una arquitectura por capas

Cada petición pasa por cuatro capas antes de llegar a la base de datos:

```
Petición → Router → Controller → Service → Repository → Base de datos
```

| Capa       | Responsabilidad                            |
| ---------- | ------------------------------------------ |
| Router     | Define las rutas y aplica middlewares      |
| Controller | Recibe la petición y devuelve la respuesta |
| Service    | Lógica de negocio y validaciones           |
| Repository | Acceso a la base de datos                  |

## Decisiones de diseño importantes

Estas son decisiones específicas del proyecto que conviene entender antes de modificar el código:

**Sin ORM** — Las consultas SQL se escriben directamente con `better-sqlite3` para mantener la simplicidad.

**Servicios en el frontend** — Los componentes nunca llaman a `fetch()` directamente. Toda comunicación con la API pasa por los archivos en `client/src/services/`. Esto facilita cambiar la URL base o agregar headers sin tocar los componentes.

**category_id es opcional** — Un producto puede existir sin categoría. En la base de datos queda como `NULL`.

**Sin React Router** — La navegación entre pantallas se maneja con `useState` en `App.tsx`. El proyecto tiene pocas pantallas y no justifica la complejidad de un enrutador por ahora.

**Electron usa import() dinámico** — El servidor Express se importa directamente en el proceso de Electron en vez de levantarlo como proceso separado. Esto evita depender de que Node.js esté instalado en el equipo del usuario.
