import { useState, type FormEvent } from "react";
import type { Category, Product, ProductInput } from "../types";

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  onSubmit: (data: ProductInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  serverError: string | null;
}

function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  submitting,
  serverError,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id?.toString() ?? ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (name.trim() === "") newErrors.name = "El nombre es obligatorio";
    if (price === "" || Number(price) < 0)
      newErrors.price = "Ingresa un precio válido";
    if (stock === "" || Number(stock) < 0)
      newErrors.stock = "Ingresa un stock válido";
    if (categoryId === "") newErrors.categoryId = "Selecciona una categoría";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      sku: sku.trim() || undefined,
      price: Number(price),
      stock: Number(stock),
      category_id: Number(categoryId),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Descripción (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">SKU (opcional)</label>
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Precio</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {errors.price && (
            <p className="text-danger text-xs mt-1">{errors.price}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {errors.stock && (
            <p className="text-danger text-xs mt-1">{errors.stock}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-danger text-xs mt-1">{errors.categoryId}</p>
        )}
      </div>

      {serverError && (
        <p className="text-danger text-sm bg-danger/10 rounded-xl px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-sm font-medium text-muted hover:bg-bg cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-full text-sm font-medium bg-accent text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;