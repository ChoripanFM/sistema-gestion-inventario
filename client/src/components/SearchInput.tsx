import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-xs">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Buscar..."}
        className="w-full pl-9 pr-3 py-2 rounded-full border border-line bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}

export default SearchInput;