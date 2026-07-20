import { Pencil, Trash2 } from "lucide-react";
import type { Category, Product } from "../types";

interface CategoryTableProps {
  categories: Category[];
  products: Product[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const BADGE_COLORS = [
  "bg-accent/15 text-accent",
  "bg-success/15 text-success",
  "bg-amber-500/15 text-amber-600",
];

function CategoryTable({
  categories,
  products,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-surface rounded-3xl shadow-sm p-10 text-center text-muted text-sm">
        No hay categorías registradas todavía.
      </div>
    );
  }

  function countProducts(categoryId: number): number {
    return products.filter((p) => p.category_id === categoryId).length;
  }

  return (
    <div className="bg-surface rounded-3xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
            <th className="px-6 py-4 font-medium">Categoría</th>
            <th className="px-6 py-4 font-medium">Descripción</th>
            <th className="px-6 py-4 font-medium text-center">Productos</th>
            <th className="px-6 py-4 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr
              key={category.id}
              className="border-t border-line hover:bg-bg/60"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-xs ${
                      BADGE_COLORS[index % BADGE_COLORS.length]
                    }`}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">{category.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-muted">
                {category.description ?? "—"}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-bg text-xs font-medium text-muted">
                  {countProducts(category.id)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2 rounded-full text-muted hover:bg-accent/10 hover:text-accent cursor-pointer"
                    aria-label="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="p-2 rounded-full text-muted hover:bg-danger/10 hover:text-danger cursor-pointer"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;
