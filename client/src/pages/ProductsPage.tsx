import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";
import Modal from "../components/Modal";
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

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([getProducts(), getCategories()])
      .then(([productsData, categoriesData]) => {
        if (!ignore) {
          setProducts(productsData);
          setCategories(categoriesData);
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

  function refreshData() {
    setLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

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

  async function handleSubmit(data: ProductInput) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setActionError(null);
    try {
      await deleteProduct(product.id);
      refreshData();
    } catch (err) {
      setActionError((err as Error).message);
    }
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
          disabled={categories.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-accent text-surface hover:bg-accent/90"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </header>

       <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o SKU..."
        />
      </div>

      {categories.length === 0 && !loading && !fetchError && (
        <div className="bg-amber-500/10 text-amber-600 rounded-2xl px-5 py-4 text-sm mb-4">
          Necesitas crear al menos una categoría antes de poder agregar productos.
        </div>
      )}

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
        />
      )}

      {loading && <p className="text-muted text-sm">Cargando productos…</p>}

      {fetchError && (
        <ErrorBanner message={`No se pudo conectar con la API: ${fetchError}`} />
      )}

      {!loading && !fetchError && (
        <ProductTable
          products={filteredProducts} 
          categories={categories}
          onEdit={openEditModal}
          onDelete={handleDelete}
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

    </div>
  );
}

export default ProductsPage;