import { ImageOff, Pencil, Trash2 } from "lucide-react";
import type { Category, Product } from "../types";
import { IMAGE_BASE_URL } from "../services/productService";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (checked: boolean) => void;
}

function ProductTable({ 
  products, 
  categories, 
  onEdit, 
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-surface rounded-3xl shadow-sm p-10 text-center text-muted text-sm">
        No hay productos registrados todavía.
      </div>
    );
  }

  function getCategoryName(categoryId: number | null): string {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Sin categoría";
  }

  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  return (
    <div className="bg-surface rounded-3xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
            <th className="pl-6 pr-2 py-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded accent-accent cursor-pointer"
                aria-label="Seleccionar todos"
              />
            </th>
            <th className="px-2 py-4 font-medium"></th>
            <th className="px-6 py-4 font-medium">Producto</th>
            <th className="px-6 py-4 font-medium">SKU</th>
            <th className="px-6 py-4 font-medium">Categoría</th>
            <th className="px-6 py-4 font-medium text-right">Precio</th>
            <th className="px-6 py-4 font-medium">Stock</th>
            <th className="px-6 py-4 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const lowStock = product.stock <= 5;
            const isSelected = selectedIds.has(product.id);
            return (
              <tr
                key={product.id}
                className={`border-t border-line hover:bg-bg/60 ${
                  isSelected ? "bg-accent/5" : ""
                }`}
              >
                <td className="pl-6 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(product.id)}
                    className="w-4 h-4 rounded accent-accent cursor-pointer"
                    aria-label={`Seleccionar ${product.name}`}
                  />
                </td>
                <td className="px-2 py-3">
                  <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center overflow-hidden shrink-0">
                    {product.image ? (
                      <img
                        src={`${IMAGE_BASE_URL}/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageOff size={16} className="text-muted" />
                    )}
                  </div>
                </td>
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
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 rounded-full text-muted hover:bg-accent/10 hover:text-accent cursor-pointer"
                      aria-label="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 rounded-full text-muted hover:bg-danger/10 hover:text-danger cursor-pointer"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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