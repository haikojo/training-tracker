import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { listExercises } from '../../data/repos/exercisesRepo';
import { getLastSessionForExercise, getSessionById, updateSession } from '../../data/repos/sessionsRepo';
import { listRoutines } from '../../data/repos/routinesRepo';
import type { SessionExercise, WorkoutSession } from '../../domain/types';
import { ExerciseCard } from './components/ExerciseCard';
import {
  clampReps,
  clampWeight,
  copyLastSetDefaults,
  formatPlannedTarget,
  getNewSetDefaults,
  getPlannedTargetForExercise,
  updateEntryInSession,
  updateSetInEntry
} from './logic';

function parseNotice(state: unknown): string {
  if (!state || typeof state !== 'object' || !('notice' in state)) {
    return '';
  }

  const maybeNotice = (state as { notice?: unknown }).notice;
  return typeof maybeNotice === 'string' ? maybeNotice : '';
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function toNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function WorkoutLoggerScreen() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<WorkoutSession | null>(() =>
    sessionId ? getSessionById(sessionId) ?? null : null
  );

  const notice = parseNotice(location.state);

  const exercises = useMemo(() => listExercises(), []);
  const routines = useMemo(() => listRoutines(), []);

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedEffort, setSelectedEffort] = useState<number | undefined>(undefined);
  const [showNotes, setShowNotes] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');

  useEffect(() => {
    const nextSession = sessionId ? getSessionById(sessionId) ?? null : null;
    setSession(nextSession);

    if (nextSession) {
      setSelectedDuration(nextSession.durationMinutes ?? 60);
      setSelectedEffort(nextSession.effort);
      setFinishNotes(nextSession.notes ?? '');
    }
  }, [sessionId]);

  const exerciseNameMap = useMemo(() => {
    const nextMap = new Map<string, string>();
    exercises.forEach((exercise) => nextMap.set(exercise.id, exercise.name));
    return nextMap;
  }, [exercises]);

  const plannedExerciseMap = useMemo(() => {
    if (!session) {
      return new Map<string, ReturnType<typeof getPlannedTargetForExercise>>();
    }

    const day = routines
      .flatMap((routine) => routine.days)
      .find((candidateDay) => candidateDay.id === session.templateDayId);

    const map = new Map<string, ReturnType<typeof getPlannedTargetForExercise>>();

    if (!day) {
      return map;
    }

    sortByOrder(day.plannedExercises).forEach((planned) => {
      map.set(planned.exerciseId, getPlannedTargetForExercise(day.plannedExercises, planned.exerciseId));
    });

    return map;
  }, [routines, session]);

  function persistEntries(entries: SessionExercise[]): void {
    if (!session) {
      return;
    }

    const updated = updateSession(session.id, { entries });
    setSession(updated);
  }

  function addSet(entryId: string): void {
    if (!session) {
      return;
    }

    const entry = session.entries.find((item) => item.id === entryId);

    if (!entry) {
      return;
    }

    const defaults = getNewSetDefaults({
      currentSets: entry.sets,
      lastExerciseSession: getLastSessionForExercise(entry.exerciseId),
      exerciseId: entry.exerciseId,
      plannedTarget: plannedExerciseMap.get(entry.exerciseId) ?? undefined
    });

    const nextEntries = updateEntryInSession(session.entries, entryId, (currentEntry) => ({
      ...currentEntry,
      sets: [
        ...currentEntry.sets,
        {
          id: crypto.randomUUID(),
          reps: defaults.reps,
          weight: defaults.weight
        }
      ]
    }));

    persistEntries(nextEntries);
  }

  function copyLastSet(entryId: string): void {
    if (!session) {
      return;
    }

    const entry = session.entries.find((item) => item.id === entryId);

    if (!entry) {
      return;
    }

    const defaults = copyLastSetDefaults(entry.sets);

    if (!defaults) {
      return;
    }

    const nextEntries = updateEntryInSession(session.entries, entryId, (currentEntry) => ({
      ...currentEntry,
      sets: [
        ...currentEntry.sets,
        {
          id: crypto.randomUUID(),
          reps: defaults.reps,
          weight: defaults.weight
        }
      ]
    }));

    persistEntries(nextEntries);
  }

  function adjustReps(entryId: string, setId: string, delta: number): void {
    if (!session) {
      return;
    }

    const nextEntries = updateEntryInSession(session.entries, entryId, (entry) =>
      updateSetInEntry(entry, setId, (set) => ({ ...set, reps: clampReps(set.reps + delta) }))
    );

    persistEntries(nextEntries);
  }

  function adjustWeight(entryId: string, setId: string, delta: number): void {
    if (!session) {
      return;
    }

    const nextEntries = updateEntryInSession(session.entries, entryId, (entry) =>
      updateSetInEntry(entry, setId, (set) => ({ ...set, weight: clampWeight(set.weight + delta) }))
    );

    persistEntries(nextEntries);
  }

  function manualReps(entryId: string, setId: string, value: string): void {
    const parsed = toNumber(value);

    if (parsed === null) {
      return;
    }

    if (!session) {
      return;
    }

    const nextEntries = updateEntryInSession(session.entries, entryId, (entry) =>
      updateSetInEntry(entry, setId, (set) => ({ ...set, reps: clampReps(parsed) }))
    );

    persistEntries(nextEntries);
  }

  function manualWeight(entryId: string, setId: string, value: string): void {
    const parsed = toNumber(value);

    if (parsed === null) {
      return;
    }

    if (!session) {
      return;
    }

    const nextEntries = updateEntryInSession(session.entries, entryId, (entry) =>
      updateSetInEntry(entry, setId, (set) => ({ ...set, weight: clampWeight(parsed) }))
    );

    persistEntries(nextEntries);
  }

  function toggleDone(entryId: string, setId: string): void {
    if (!session) {
      return;
    }

    const nextEntries = updateEntryInSession(session.entries, entryId, (entry) =>
      updateSetInEntry(entry, setId, (set) => ({
        ...set,
        completedAt: set.completedAt ? undefined : new Date().toISOString()
      }))
    );

    persistEntries(nextEntries);
  }

  function adjustDuration(delta: number): void {
    setSelectedDuration((prev) => Math.max(0, prev + delta));
  }

  function saveAndFinish(): void {
    if (!session) {
      return;
    }

    updateSession(session.id, {
      durationMinutes: selectedDuration,
      effort: selectedEffort,
      notes: finishNotes.trim() || undefined
    });

    setIsFinishModalOpen(false);
    navigate('/history');
  }

  if (!sessionId) {
    return (
      <section className="page logger-page">
        <h1>Workout Logger</h1>
        <article className="card form-stack">
          <p className="form-error">Missing session id.</p>
          <Link className="inline-link" to="/start">
            Back to Start Workout
          </Link>
        </article>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="page">
        <h1>Workout Logger</h1>
        <article className="card form-stack">
          <p className="form-error">Session not found.</p>
          <Link className="inline-link" to="/start">
            Back to Start Workout
          </Link>
        </article>
      </section>
    );
  }

  return (
    <>
      <section className="page">
        <h1>{session.name}</h1>
        <p className="exercise-meta">{new Date(session.date).toLocaleString()}</p>
        {notice ? <article className="card exercise-meta">{notice}</article> : null}

        <div className="exercise-list" role="list">
          {session.entries.map((entry, index) => (
            <ExerciseCard
              key={entry.id}
              index={index}
              name={exerciseNameMap.get(entry.exerciseId) ?? 'Unknown exercise'}
              plannedTarget={formatPlannedTarget(plannedExerciseMap.get(entry.exerciseId) ?? undefined)}
              entry={entry}
              canCopyLastSet={entry.sets.length > 0}
              onAddSet={addSet}
              onCopyLastSet={copyLastSet}
              onAdjustReps={adjustReps}
              onAdjustWeight={adjustWeight}
              onManualReps={manualReps}
              onManualWeight={manualWeight}
              onToggleDone={toggleDone}
            />
          ))}
        </div>
      </section>

      <div className="finish-workout-bar">
        <Button type="button" className="finish-workout-btn" onClick={() => setIsFinishModalOpen(true)}>
          Finish Workout
        </Button>
      </div>

      {isFinishModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Finish workout">
          <article className="modal-sheet form-stack">
            <h2 className="section-title">Finish Workout</h2>

            <div className="form-stack">
              <span className="input-label">Duration (minutes)</span>
              <p className="duration-value">{selectedDuration} min</p>
              <div className="preset-grid">
                {[30, 45, 60, 75, 90].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={selectedDuration === value ? 'primary' : 'secondary'}
                    className="mini-pill"
                    onClick={() => setSelectedDuration(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="row-actions">
                <Button type="button" variant="secondary" onClick={() => adjustDuration(-5)}>
                  -5 min
                </Button>
                <Button type="button" variant="secondary" onClick={() => adjustDuration(5)}>
                  +5 min
                </Button>
              </div>
            </div>

            <div className="form-stack">
              <span className="input-label">Effort (1 easy - 10 max)</span>
              <div className="effort-grid">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={selectedEffort === value ? 'primary' : 'secondary'}
                    className="mini-pill"
                    onClick={() => setSelectedEffort(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="form-stack">
              <Button type="button" variant="secondary" onClick={() => setShowNotes((prev) => !prev)}>
                {showNotes ? 'Hide Notes' : 'Add Notes'}
              </Button>
              {showNotes ? (
                <label className="input-field" htmlFor="finishNotes">
                  <span className="input-label">Notes</span>
                  <textarea
                    id="finishNotes"
                    className="text-input notes-area"
                    value={finishNotes}
                    onChange={(event) => setFinishNotes(event.target.value)}
                    placeholder="Optional notes"
                  />
                </label>
              ) : null}
            </div>

            <div className="row-actions">
              <Button type="button" onClick={saveAndFinish}>
                Save & Finish
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsFinishModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
