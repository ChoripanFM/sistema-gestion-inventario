import type { Category } from "../types";

interface CategoryTableProps {
  categories: Category[];
}

/**
 * Componente de presentación puro: recibe una lista de categorías
 * y las muestra en formato de tabla. No sabe de dónde vienen los datos
 * (mock o API real) — solo los renderiza.
 */
function CategoryTable({ categories }: CategoryTableProps) {
  if (categories.length === 0) {
    return <p>No hay categorías registradas todavía.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <td>{category.id}</td>
            <td>{category.name}</td>
            <td>{category.description ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CategoryTable;