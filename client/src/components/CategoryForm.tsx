import { useState, type FormEvent } from "react";
import type { Category, CategoryInput } from "../types";

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CategoryInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  serverError: string | null;
}

function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
  serverError,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [nameError, setNameError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (name.trim() === "") {
      setNameError("El nombre es obligatorio");
      return;
    }
    setNameError(null);

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
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
          placeholder="Ej: Electrónica"
        />
        {nameError && (
          <p className="text-danger text-xs mt-1">{nameError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Descripción (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
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

export default CategoryForm;