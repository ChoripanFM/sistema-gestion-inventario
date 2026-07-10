import { useEffect, useState } from "react";
import ProductTable from "../components/ProductTable";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import type { Product, Category } from "../types";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Productos</h2>
        <p className="text-muted text-sm mt-1">
          Inventario completo de productos
        </p>
      </header>

      {loading && <p className="text-muted text-sm">Cargando productos…</p>}

      {error && (
        <div className="bg-danger/10 text-danger rounded-2xl px-5 py-4 text-sm">
          No se pudo conectar con la API: {error}
        </div>
      )}

      {!loading && !error && (

        <ProductTable products={products} categories={categories} />
      )}
     </div>
  );
}

export default ProductsPage;