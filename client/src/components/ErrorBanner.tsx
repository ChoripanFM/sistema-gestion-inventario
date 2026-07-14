import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-danger/10 text-danger rounded-2xl px-5 py-4 text-sm mb-4">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 hover:opacity-70 cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;