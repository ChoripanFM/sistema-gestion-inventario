import type { Category, Product } from "../types";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
}

function ProductTable({ products, categories }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-surface rounded-3x1 shadow-sm p-10 text-center text-muted text-sm">
        No hay productos registrados todavía.
      </div>
    );
  }

  function getCategoryName(categoryId: number): string {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Sin categoría";
  }

  return (
    <div className="bg-surface rounded-3xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
            <th className="px-6 py-4 font-medium">Producto</th>
            <th className="px-6 py-4 font-medium">SKU</th>
            <th className="px-6 py-4 font-medium">Categoría</th>
            <th className="px-6 py-4 font-medium text-right">Precio</th>
            <th className="px-6 py-4 font-medium">Stock</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const lowStock = product.stock < 5;

          return (
            <tr key={product.id} className="border-t border-line hover:bg-bg/60">
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4 text-muted">{product.sku ?? "—"}</td>
                <td className="px-6 py-4 text-muted">
                  {getCategoryName(product.category_id)}
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  ${product.price.toLocaleString("es-CL")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      lowStock
                        ? "bg-danger/15 text-danger"
                        : "bg-success/15 text-success"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        lowStock ? "bg-danger" : "bg-success"
                      }`}
                    />
                    {lowStock 
                      ? `Stock bajo (${product.stock})` 
                      : `En stock (${product.stock})`}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;