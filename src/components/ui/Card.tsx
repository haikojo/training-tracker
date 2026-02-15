import type { HTMLAttributes, PropsWithChildren } from 'react';
import './card.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'section' | 'div';
}

export function Card({ as = 'article', className = '', children, ...props }: PropsWithChildren<CardProps>) {
  const Comp = as;
  return (
    <Comp {...props} className={['ui-card', className].filter(Boolean).join(' ')}>
      {children}
    </Comp>
  );
}
