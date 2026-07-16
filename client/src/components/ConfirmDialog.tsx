import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  checkboxLabel?: string;
  onConfirm: (checked: boolean) => void;
  onCancel: () => void;
}

function ConfirmDialog({
  message,
  confirmLabel = "Eliminar",
  checkboxLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4"
      onClick={onCancel}
    >
      <div
        className="bg-surface rounded-3xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end -mt-1 -mr-1 mb-1">
          <button
            onClick={onCancel}
            className="text-muted hover:text-ink cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <AlertTriangle size={32} className="text-danger shrink-0" />
          <p className="text-base font-medium text-ink leading-snug">
            {message}
          </p>
        </div>

        {checkboxLabel && (
          <label className="flex items-center gap-2 mt-4 pl-12 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4 h-4 rounded accent-danger cursor-pointer"
            />
            {checkboxLabel}
          </label>
        )}

        <div className="flex justify-end gap-2 pt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium text-muted hover:bg-bg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(checked)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-danger text-white hover:opacity-90 cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;