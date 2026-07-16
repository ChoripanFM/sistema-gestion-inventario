import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CategoryTable from "../components/CategoryTable";
import CategoryForm from "../components/CategoryForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchInput from "../components/SearchInput";
import ErrorBanner from "../components/ErrorBanner";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { getProducts } from "../services/productService";
import type { Category, CategoryInput, Product } from "../types";

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    let ignore = false;

    Promise.all([getCategories(), getProducts()])
      .then(([categoriesData, productsData]) => {
        if (!ignore) {
          setCategories(categoriesData);
          setProducts(productsData);
        }
      })
      .catch((err) => {
        if (!ignore) setFetchError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function refreshCategories() {
    setLoading(true);
    Promise.all([getCategories(), getProducts()])
      .then(([categoriesData, productsData]) => {
        setCategories(categoriesData);
        setProducts(productsData);
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function openCreateModal() {
    setEditingCategory(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(data: CategoryInput) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      setIsModalOpen(false);
      refreshCategories();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete(deleteProducts: boolean) {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteCategory(pendingDelete.id, deleteProducts);
      setPendingDelete(null);
      refreshCategories();
    } catch (err) {
      setActionError((err as Error).message);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Categorías</h2>
          <p className="text-muted text-sm mt-1">
            Clasificación de productos del inventario
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-accent text-surface hover:bg-accent/90"
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </header>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar categoría..."
        />
      </div>

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
        />
      )}

        {loading && <p className="text-muted text-sm">Cargando categorías…</p>}

        {fetchError && (
        <ErrorBanner message={`No se pudo conectar con la API: ${fetchError}`} />
      )}

        {!loading && !fetchError && (
          <CategoryTable
            categories={filteredCategories}
            products={products}
            onEdit={openEditModal}
            onDelete={setPendingDelete}
          />
        )}

        {isModalOpen && (
        <Modal
          title={editingCategory ? "Editar categoría" : "Nueva categoría"}
          onClose={() => setIsModalOpen(false)}
        >
          <CategoryForm
            initialData={editingCategory ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            submitting={submitting}
            serverError={formError}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Eliminar Categoría "${pendingDelete.name}"?`}
          checkboxLabel="Eliminar también los productos de esta categoría"
          confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

export default CategoriesPage;