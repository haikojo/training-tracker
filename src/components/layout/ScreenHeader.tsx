import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  return (
    <div className="page-title-row">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="page-title-subtitle">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
