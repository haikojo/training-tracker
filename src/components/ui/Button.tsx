import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import './button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className = '', children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      className={['ui-btn', `ui-btn-${variant}`, className].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}
