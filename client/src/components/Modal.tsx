import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-3xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;