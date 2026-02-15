import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell-bg">
      <div className="app-shell-frame">{children}</div>
    </div>
  );
}
