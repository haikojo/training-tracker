import { useEffect, useRef } from 'react';
import { Button } from '../../../components/Button';
import { IconButton } from '../../../components/ui/IconButton';
import type { SessionSet } from '../../../domain/types';

interface SetRowProps {
  set: SessionSet;
  index: number;
  isNew?: boolean;
  onAdjustReps: (setId: string, delta: number) => void;
  onAdjustWeight: (setId: string, delta: number) => void;
  onManualReps: (setId: string, value: string) => void;
  onManualWeight: (setId: string, value: string) => void;
  onToggleDone: (setId: string) => void;
}

export function SetRow({
  set,
  index,
  isNew = false,
  onAdjustReps,
  onAdjustWeight,
  onManualReps,
  onManualWeight,
  onToggleDone
}: SetRowProps) {
  const rowRef = useRef<HTMLElement>(null);
  const isDone = Boolean(set.completedAt);

  useEffect(() => {
    if (!isNew || !rowRef.current) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    rowRef.current.scrollIntoView({
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }, [isNew]);

  return (
    <article
      ref={rowRef}
      className={['set-row', isDone ? 'set-row-done' : '', isNew ? 'set-row-enter' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <p className="set-label">Set {index + 1}</p>

      <div className="set-control">
        <span className="set-control-label">Weight (kg)</span>
        <div className="set-adjust">
          <IconButton type="button" variant="secondary" className="tiny-btn" onClick={() => onAdjustWeight(set.id, -2.5)}>
            -
          </IconButton>
          <input
            className="set-value-input"
            inputMode="decimal"
            value={String(set.weight)}
            onChange={(event) => onManualWeight(set.id, event.target.value)}
            aria-label={`Set ${index + 1} weight`}
          />
          <IconButton type="button" variant="secondary" className="tiny-btn" onClick={() => onAdjustWeight(set.id, 2.5)}>
            +
          </IconButton>
        </div>
        <div className="weight-steps">
          <Button type="button" variant="secondary" className="micro-btn" onClick={() => onAdjustWeight(set.id, -1.25)}>
            -1.25
          </Button>
          <Button type="button" variant="secondary" className="micro-btn" onClick={() => onAdjustWeight(set.id, 1.25)}>
            +1.25
          </Button>
          <Button type="button" variant="secondary" className="micro-btn" onClick={() => onAdjustWeight(set.id, -2.5)}>
            -2.5
          </Button>
          <Button type="button" variant="secondary" className="micro-btn" onClick={() => onAdjustWeight(set.id, 2.5)}>
            +2.5
          </Button>
          <Button type="button" variant="secondary" className="micro-btn" onClick={() => onAdjustWeight(set.id, -5)}>
            -5
          </Button>
          <Button type="button" variant="secondary" className="micro-btn" onClick={() => onAdjustWeight(set.id, 5)}>
            +5
          </Button>
        </div>
      </div>

      <div className="set-control">
        <span className="set-control-label">Reps</span>
        <div className="set-adjust">
          <IconButton type="button" variant="secondary" className="tiny-btn" onClick={() => onAdjustReps(set.id, -1)}>
            -
          </IconButton>
          <input
            className="set-value-input"
            inputMode="numeric"
            value={String(set.reps)}
            onChange={(event) => onManualReps(set.id, event.target.value)}
            aria-label={`Set ${index + 1} reps`}
          />
          <IconButton type="button" variant="secondary" className="tiny-btn" onClick={() => onAdjustReps(set.id, 1)}>
            +
          </IconButton>
        </div>
      </div>

      <label className="done-toggle" htmlFor={`done-${set.id}`}>
        <input id={`done-${set.id}`} type="checkbox" checked={isDone} onChange={() => onToggleDone(set.id)} />
        <span className={isDone ? 'done-indicator done-indicator-visible' : 'done-indicator'} aria-hidden="true">
          ✓
        </span>
        <span>{isDone ? 'Done' : 'Mark done'}</span>
      </label>
    </article>
  );
}
