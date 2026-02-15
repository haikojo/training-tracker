import type { HTMLAttributes, PropsWithChildren } from 'react';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'danger' | 'success';
}

export function Pill({ tone = 'neutral', className = '', children, ...props }: PropsWithChildren<PillProps>) {
  return (
    <span {...props} className={['ui-pill', `ui-pill-${tone}`, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
