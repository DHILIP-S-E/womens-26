import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20 ${error ? 'border-[hsl(var(--destructive))]' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[hsl(var(--destructive))]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
