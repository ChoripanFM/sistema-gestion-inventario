import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Si se define, muestra un checkbox opcional (ej. "borrar productos asociados") */
  checkboxLabel?: string;
  onConfirm: (checked: boolean) => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  checkboxLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [checked, setChecked] = useState(false);

  return (
    <Modal title={title} onClose={onCancel}>
      <div className="flex gap-3">
        <AlertTriangle size={22} className="text-danger shrink-0 mt-0.5" />
        <p className="text-sm text-ink">{message}</p>
      </div>

      {checkboxLabel && (
        <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-4 h-4 rounded accent-danger cursor-pointer"
          />
          {checkboxLabel}
        </label>
      )}

      <div className="flex justify-end gap-2 pt-5">
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
    </Modal>
  );
}

export default ConfirmDialog;