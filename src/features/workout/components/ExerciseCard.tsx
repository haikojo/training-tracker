import { Button } from '../../../components/Button';
import type { SessionExercise } from '../../../domain/types';
import { SetRow } from './SetRow';

interface ExerciseCardProps {
  index: number;
  name: string;
  plannedTarget: string | null;
  entry: SessionExercise;
  canCopyLastSet: boolean;
  onAddSet: (entryId: string) => void;
  onCopyLastSet: (entryId: string) => void;
  onAdjustReps: (entryId: string, setId: string, delta: number) => void;
  onAdjustWeight: (entryId: string, setId: string, delta: number) => void;
  onManualReps: (entryId: string, setId: string, value: string) => void;
  onManualWeight: (entryId: string, setId: string, value: string) => void;
  onToggleDone: (entryId: string, setId: string) => void;
}

export function ExerciseCard({
  index,
  name,
  plannedTarget,
  entry,
  canCopyLastSet,
  onAddSet,
  onCopyLastSet,
  onAdjustReps,
  onAdjustWeight,
  onManualReps,
  onManualWeight,
  onToggleDone
}: ExerciseCardProps) {
  return (
    <article className="card exercise-row" role="listitem">
      <div>
        <p className="exercise-name">
          {index + 1}. {name}
        </p>
        {plannedTarget ? <p className="exercise-meta">{plannedTarget}</p> : null}
      </div>

      <div className="row-actions">
        <Button type="button" onClick={() => onAddSet(entry.id)}>
          Add Set
        </Button>
        <Button type="button" variant="secondary" onClick={() => onCopyLastSet(entry.id)} disabled={!canCopyLastSet}>
          Copy Last Set
        </Button>
      </div>

      <div className="sets-stack">
        {entry.sets.map((set, setIndex) => (
          <SetRow
            key={set.id}
            set={set}
            index={setIndex}
            onAdjustReps={(setId, delta) => onAdjustReps(entry.id, setId, delta)}
            onAdjustWeight={(setId, delta) => onAdjustWeight(entry.id, setId, delta)}
            onManualReps={(setId, value) => onManualReps(entry.id, setId, value)}
            onManualWeight={(setId, value) => onManualWeight(entry.id, setId, value)}
            onToggleDone={(setId) => onToggleDone(entry.id, setId)}
          />
        ))}

        {entry.sets.length === 0 ? <p className="exercise-meta">No sets yet.</p> : null}
      </div>
    </article>
  );
}
