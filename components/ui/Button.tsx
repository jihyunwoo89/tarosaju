'use client';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:opacity-90',
  secondary: 'bg-transparent text-accent border border-accent hover:bg-accent/5',
  ghost: 'bg-transparent text-text border border-border hover:bg-surface',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', className = '', ...rest }, ref) => (
    <button
      ref={ref}
      className={`min-h-11 px-5 rounded text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
