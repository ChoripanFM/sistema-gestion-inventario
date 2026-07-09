import ProductTable from "../components/ProductTable";
import { mockProducts, mockCategories } from "../services/mockData";

function ProductsPage() {
  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Productos</h2>
        <p className="text-muted text-sm mt-1">
          Inventario completo de productos
        </p>
      </header>

      <ProductTable products={mockProducts} categories={mockCategories} />
    </div>
  );
}

export default ProductsPage;