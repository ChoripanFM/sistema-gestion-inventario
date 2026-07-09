import { useState} from "react";
import { LayoutGrid, Package, Boxes } from "lucide-react";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";

type View = "categories" | "products";

const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutGrid }[] = [
  { id: "categories", label: "Categorías", icon: LayoutGrid },
  { id: "products", label: "Productos", icon: Package },
];

function App() {
  const [view, setView] = useState<View>("categories");

  return (
    <div className="min-h-screen flex bg-bg text-ink font-body">
      <aside className="w-64 shrink-0 bg-navy text-white flex flex-col rounded-r-3xl">
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Boxes size={22} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-sm">Inventario</p>
            <p className="text-[11px] text-white/50">Panel de gestión</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors cursor-pointer ${
                view === id
                  ? "bg-accent text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>

        <div className="px-6 py-5 text-[11px] text-white/40">
          Sistema de Gestión de Inventario
        </div>
      </aside>

      <main className="flex-1 px-10 py-8">
        {view === "categories" ? <CategoriesPage /> : <ProductsPage />}
      </main>
    </div>
  );
}

export default App;