import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className = '', children, ...props }: PropsWithChildren<ButtonProps>) {
  const variantClass = `button-${variant}`;
  const joinedClassName = ['ui-button', variantClass, className].filter(Boolean).join(' ');

  return (
    <button {...props} className={joinedClassName}>
      {children}
    </button>
  );
}
