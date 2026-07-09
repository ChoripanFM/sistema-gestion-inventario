import { useEffect, useState } from "react";
import CategoryTable from "../components/CategoryTable";
import { getCategories } from "../services/categoryService";
import type { Category } from "../types";

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Categorías</h2>
        <p className="text-muted text-sm mt-1">
          Clasificación de productos del inventario
        </p>
      </header>

      {loading && <p className="text-muted text-sm">Cargando categorías…</p>}

      {error && (
        <div className="bg-danger/10 text-danger rounded-2xl px-5 py-4 text-sm">
          No se pudo conectar con la API: {error}
        </div>
      )}

      {!loading && !error && <CategoryTable categories={categories} />}
    </div>
  );
}

export default CategoriesPage;