import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Trash2 } from "lucide-react";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchInput from "../components/SearchInput";
import ErrorBanner from "../components/ErrorBanner";
import { getCategories } from "../services/categoryService";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import type { Category, Product, ProductInput } from "../types";

const NO_CATEGORY_VALUE = "none";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Espera 300ms después de que el usuario deja de escribir antes de buscar.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Carga inicial de categorías (no cambia con la búsqueda/filtro).
  useEffect(() => {
    let ignore = false;
    getCategories()
      .then((data) => {
        if (!ignore) setCategories(data);
      })
      .catch((err) => {
        if (!ignore) setFetchError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Carga de productos: se re-ejecuta cada vez que cambia la búsqueda o el filtro.
  useEffect(() => {
    let ignore = false;

    const categoryId =
      categoryFilter && categoryFilter !== NO_CATEGORY_VALUE
        ? Number(categoryFilter)
        : undefined;

    getProducts({ search: debouncedSearch || undefined, categoryId })
      .then((data) => {
        if (!ignore) {
          const finalData =
            categoryFilter === NO_CATEGORY_VALUE
              ? data.filter((p) => p.category_id === null)
              : data;
          setProducts(finalData);
          setSelectedIds(new Set());
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
  }, [debouncedSearch, categoryFilter]);

  function refreshData() {
    setLoading(true);
    const categoryId =
      categoryFilter && categoryFilter !== NO_CATEGORY_VALUE
        ? Number(categoryFilter)
        : undefined;

    Promise.all([
      getProducts({ search: debouncedSearch || undefined, categoryId }),
      getCategories(),
    ])
      .then(([productsData, categoriesData]) => {
        const finalData =
          categoryFilter === NO_CATEGORY_VALUE
            ? productsData.filter((p) => p.category_id === null)
            : productsData;
        setProducts(finalData);
        setCategories(categoriesData);
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }

  function openCreateModal() {
    setEditingProduct(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(data: ProductInput, imageFile?: File | null) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data, imageFile);
      } else {
        await createProduct(data, imageFile);
      }
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteProduct(pendingDelete.id);
      setPendingDelete(null);
      refreshData();
    } catch (err) {
      setActionError((err as Error).message);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(products.map((p) => p.id)) : new Set());
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    setActionError(null);

    const results = await Promise.allSettled(
      Array.from(selectedIds).map((id) => deleteProduct(id)),
    );
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      setActionError(
        `No se pudieron eliminar ${failed} de ${selectedIds.size} productos.`,
      );
    }

    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    refreshData();
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Productos</h2>
          <p className="text-muted text-sm mt-1">
            Inventario completo de productos
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setLoading(true); // Muestra el estado de carga mientras se filtra la búsqueda
          }}
          placeholder="Buscar por nombre..."
        />

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setLoading(true); // Muestra el estado de carga mientras se filtra por categoría
          }}
          className="px-4 py-2 rounded-full border border-line bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          <option value={NO_CATEGORY_VALUE}>Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
        />
      )}

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-accent/10 rounded-2xl px-5 py-3 mb-4">
          <span className="text-sm font-medium text-accent">
            {selectedIds.size} producto{selectedIds.size !== 1 ? "s" : ""}{" "}
            seleccionado
            {selectedIds.size !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-danger text-white text-xs font-medium hover:opacity-90 cursor-pointer"
          >
            <Trash2 size={14} />
            Eliminar seleccionados
          </button>
        </div>
      )}

      {loading && <p className="text-muted text-sm">Cargando productos…</p>}

      {fetchError && (
        <ErrorBanner
          message={`No se pudo conectar con la API: ${fetchError}`}
        />
      )}

      {!loading && !fetchError && (
        <ProductTable
          products={products}
          categories={categories}
          onEdit={openEditModal}
          onDelete={setPendingDelete}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />
      )}

      {isModalOpen && (
        <Modal
          title={editingProduct ? "Editar producto" : "Nuevo producto"}
          onClose={() => setIsModalOpen(false)}
        >
          <ProductForm
            initialData={editingProduct ?? undefined}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            submitting={submitting}
            serverError={formError}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          message={`¿Eliminar el producto "${pendingDelete.name}"? Esta acción no se puede deshacer.`}
          confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {bulkDeleteOpen && (
        <ConfirmDialog
          message={`¿Eliminar ${selectedIds.size} producto${
            selectedIds.size !== 1 ? "s" : ""
          }? Esta acción no se puede deshacer.`}
          confirmLabel={bulkDeleting ? "Eliminando..." : "Eliminar"}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
}

export default ProductsPage;
