import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Button, type ButtonVariant } from './Button';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function IconButton({ variant = 'secondary', className = '', children, ...props }: PropsWithChildren<IconButtonProps>) {
  return (
    <Button {...props} variant={variant} className={['ui-icon-btn', className].filter(Boolean).join(' ')}>
      {children}
    </Button>
  );
}
