import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { getThemeMode, setThemeMode, type ThemeMode } from '../../theme/theme';
import { themeModeOptions } from './logic';

export default function SettingsScreen() {
  const [mode, setMode] = useState<ThemeMode>(() => getThemeMode());

  const selectedMode = useMemo(
    () => themeModeOptions.find((item) => item.value === mode),
    [mode]
  );

  function handleModeChange(nextMode: ThemeMode): void {
    setMode(nextMode);
    setThemeMode(nextMode);
  }

  return (
    <section className="page">
      <ScreenHeader
        title="Settings"
        subtitle="Personalize appearance"
        action={
          <Link className="inline-link" to="/history">
            Back
          </Link>
        }
      />

      <Card className="form-stack" as="section">
        <h2 className="section-title">Theme</h2>
        <p className="exercise-meta">Current: {selectedMode?.label}</p>

        <div className="form-stack" role="radiogroup" aria-label="Theme mode">
          {themeModeOptions.map((item) => (
            <label className="theme-option" key={item.value}>
              <input
                type="radio"
                name="themeMode"
                value={item.value}
                checked={mode === item.value}
                onChange={() => handleModeChange(item.value)}
              />
              <span className="theme-option-label">{item.label}</span>
              <span className="theme-option-meta">{item.description}</span>
            </label>
          ))}
        </div>

      </Card>
    </section>
  );
}
