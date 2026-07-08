import CategoryTable from "../components/CategoryTable";
import { mockCategories } from "../services/mockData";

/**
 * Página de categorías. Por ahora usa datos de prueba (mockCategories).
 * Cuando la API esté lista, esta será la única línea a cambiar:
 * reemplazar mockCategories por el resultado de un fetch real.
 */
function CategoriesPage() {
  return (
    <div>
      <h2>Categorías</h2>
      <h2 className="text-2xl font-bold text-blue-600">Categorías</h2>
      <CategoryTable categories={mockCategories} />
    </div>
  );
}

export default CategoriesPage;