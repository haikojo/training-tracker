import type { ThemeMode } from '../../theme/theme';

export interface ThemeModeOption {
  value: ThemeMode;
  label: string;
  description: string;
}

export const themeModeOptions: ThemeModeOption[] = [
  { value: 'system', label: 'System', description: 'Follow device appearance' },
  { value: 'light', label: 'Light', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode' }
];
