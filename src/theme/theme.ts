export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'training-tracker:theme';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function getThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : 'system';
}

export function applyThemeMode(mode: ThemeMode): void {
  const root = document.documentElement;

  if (mode === 'system') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', mode);
}

export function setThemeMode(mode: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyThemeMode(mode);
}

export function setupSystemThemeListener(): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (): void => {
    if (getThemeMode() === 'system') {
      applyThemeMode('system');
    }
  };

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
