import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import SearchInput from "../components/SearchInput";
import ErrorBanner from "../components/ErrorBanner";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { processSale } from "../services/salesService";
import type { Category, Product, SaleItem } from "../types";

interface CartLine {
  product: Product;
  quantity: number;
}

function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const NO_CATEGORY_VALUE = "none";

  function loadProducts() {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }

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

  const filteredProducts = products.filter((p) => {
  const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
  const matchesCategory =
    categoryFilter === "" 
    ? true
    : categoryFilter === NO_CATEGORY_VALUE 
      ? p.category_id === null 
      : p.category_id === Number(categoryFilter);
  return matchesSearch && matchesCategory;
});

  function quantityInCart(productId: number): number {
    return cart.find((line) => line.product.id === productId)?.quantity ?? 0;
  }

  function addToCart(product: Product) {
    const currentQty = quantityInCart(product.id);
    if (currentQty >= product.stock) return; // no supera el stock disponible

    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function decreaseFromCart(productId: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: line.quantity - 1 }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((line) => line.product.id !== productId));
  }

  const total = cart.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );

  async function handleFinalizeSale() {
    if (cart.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    const items: SaleItem[] = cart.map((line) => ({
      product_id: line.product.id,
      quantity: line.quantity,
    }));

    try {
      await processSale(items);
      setSuccessMessage("Venta procesada correctamente.");
      setCart([]);
      loadProducts(); // refresca el stock mostrado
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna izquierda: catálogo de productos */}
      <div className="lg:col-span-2">
        <header className="mb-6">
          <h2 className="font-display text-2xl font-semibold">Ventas</h2>
          <p className="text-muted text-sm mt-1">
            Selecciona productos para registrar una venta
          </p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar producto..."
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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

        {loading && <p className="text-muted text-sm">Cargando productos…</p>}

        {fetchError && (
          <ErrorBanner message={`No se pudo conectar con la API: ${fetchError}`} />
        )}

        {!loading && !fetchError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const inCart = quantityInCart(product.id);
              const outOfStock = product.stock === 0;
              const maxReached = inCart >= product.stock;

              return (
                <div
                  key={product.id}
                  className="bg-surface rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      ${product.price.toLocaleString("es-CL")} · Stock:{" "}
                      {product.stock}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={outOfStock || maxReached}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus size={14} />
                    {inCart > 0 ? inCart : "Agregar"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Columna derecha: carrito */}
      <div>
        <div className="bg-surface rounded-3xl shadow-sm p-5 sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={18} className="text-accent" />
            <h3 className="font-display font-semibold">Carrito</h3>
          </div>

          {cart.length === 0 ? (
            <p className="text-muted text-sm">
              No has agregado productos todavía.
            </p>
          ) : (
            <div className="space-y-3">
              {cart.map((line) => (
                <div
                  key={line.product.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {line.product.name}
                    </p>
                    <p className="text-xs text-muted">
                      ${line.product.price.toLocaleString("es-CL")} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => decreaseFromCart(line.product.id)}
                      className="p-1 rounded-full hover:bg-bg text-muted cursor-pointer"
                      aria-label="Restar"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-5 text-center">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(line.product)}
                      disabled={line.quantity >= line.product.stock}
                      className="p-1 rounded-full hover:bg-bg text-muted disabled:opacity-30 cursor-pointer"
                      aria-label="Sumar"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeFromCart(line.product.id)}
                      className="p-1 rounded-full hover:bg-danger/10 text-muted hover:text-danger cursor-pointer"
                      aria-label="Quitar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t border-line pt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-display font-semibold">
                  ${total.toLocaleString("es-CL")}
                </span>
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-danger text-xs bg-danger/10 rounded-xl px-3 py-2 mt-3">
              {submitError}
            </p>
          )}

          {successMessage && (
            <p className="text-success text-xs bg-success/10 rounded-xl px-3 py-2 mt-3">
              {successMessage}
            </p>
          )}

          <button
            onClick={handleFinalizeSale}
            disabled={cart.length === 0 || submitting}
            className="w-full mt-4 px-4 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Procesando..." : "Finalizar venta"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesPage;