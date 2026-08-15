import { useEffect, useState } from "react";
import {
  CalendarDays,
  LoaderCircle,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { getSalesHistory } from "../services/salesService";
import { downloadInventoryBackup } from "../services/backupService";
import type { SalesHistory } from "../types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

function HistoryPage() {
  const [history, setHistory] = useState<SalesHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);

        const data = await getSalesHistory();

        setHistory(data);
      } catch (err) {
        console.error("Error al cargar el historial:", err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el historial de ventas",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  async function handleDownloadBackup() {
    try {
      setBackupLoading(true);
      setBackupError(null);

      await downloadInventoryBackup();
    } catch (err) {
      console.error("Error al descargar el respaldo:", err);

      setBackupError(
        err instanceof Error
          ? err.message
          : "No se pudo descargar el respaldo",
      );
    } finally {
      setBackupLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex items-center gap-3 text-ink/60">
          <LoaderCircle size={22} className="animate-spin" />
          <span className="text-sm">Cargando historial...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="font-display font-semibold text-red-800">
            No se pudo cargar el historial
          </h2>

          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!history) {
    return null;
  }

  return (
    <div className="max-w-5xl">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Historial
        </h1>

        <div className="flex items-center gap-2 mt-2 text-sm text-ink/50">
          <CalendarDays size={16} />
          <span>Resumen del día {formatDate(history.date)}</span>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Total vendido */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Receipt size={20} className="text-accent" />
            </div>

            <span className="text-sm text-ink/50">
              Total vendido
            </span>
          </div>

          <p className="font-display text-3xl font-semibold text-ink">
            {formatCurrency(history.totalSales)}
          </p>
        </div>

        {/* Ventas realizadas */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
              <ShoppingBag size={20} className="text-accent" />
            </div>

            <span className="text-sm text-ink/50">
              Ventas realizadas
            </span>
          </div>

          <p className="font-display text-3xl font-semibold text-ink">
            {history.salesCount}
          </p>
        </div>
      </div>

      {/* Respaldo */}
      <div className="flex flex-col items-end gap-3 mb-6">
        <button
          type="button"
          onClick={handleDownloadBackup}
          disabled={backupLoading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <LoaderCircle
            size={17}
            className={backupLoading ? "animate-spin" : "hidden"}
          />

          {!backupLoading && <span>↓</span>}

          <span>
            {backupLoading
              ? "Generando respaldo..."
              : "Descargar respaldo"}
          </span>
        </button>

        {backupError && (
          <p className="text-sm text-red-600">
            {backupError}
          </p>
        )}
      </div>

      {/* Productos vendidos */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-ink/5">
          <h2 className="font-display font-semibold text-lg text-ink">
            Productos vendidos
          </h2>

          <p className="text-sm text-ink/50 mt-1">
            Cantidad de unidades vendidas por producto
          </p>
        </div>

        {history.products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag
              size={32}
              className="mx-auto text-ink/20 mb-3"
            />

            <p className="text-sm text-ink/50">
              No hay productos vendidos hoy.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {history.products.map((product) => (
              <div
                key={`${product.productId}-${product.productName}`}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-ink">
                    {product.productName}
                  </p>

                </div>

                <div className="text-right">
                  <p className="font-semibold text-ink">
                    {product.quantity}
                  </p>

                  <p className="text-xs text-ink/40">
                    {product.quantity === 1
                      ? "unidad"
                      : "unidades"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;