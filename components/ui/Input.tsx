'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id ?? `input-${label}`;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-xs uppercase tracking-wider text-muted">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`min-h-11 px-3 rounded border bg-surface text-text outline-none focus:border-accent ${error ? 'border-accent' : 'border-border'} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && <span id={`${inputId}-error`} className="text-xs text-accent">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
