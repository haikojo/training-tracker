import { useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import type { DayTemplate, Exercise, PlannedExercise, RoutineTemplate } from '../../domain/types';
import { listExercises } from '../../data/repos/exercisesRepo';
import { addRoutine, listRoutines, removeRoutine, updateRoutine } from '../../data/repos/routinesRepo';

interface PlannedExerciseForm {
  exerciseId: string;
  targetSets: string;
  targetReps: string;
  targetWeight: string;
  notes: string;
}

const defaultPlannedExerciseForm: PlannedExerciseForm = {
  exerciseId: '',
  targetSets: '3',
  targetReps: '8-10',
  targetWeight: '',
  notes: ''
};

function sortDays(days: DayTemplate[]): DayTemplate[] {
  return [...days].sort((a, b) => a.order - b.order);
}

function sortPlannedExercises(exercises: PlannedExercise[]): PlannedExercise[] {
  return [...exercises].sort((a, b) => a.order - b.order);
}

function normalizeDayOrder(days: DayTemplate[]): DayTemplate[] {
  return sortDays(days).map((day, index) => ({ ...day, order: index + 1 }));
}

function normalizePlannedExerciseOrder(exercises: PlannedExercise[]): PlannedExercise[] {
  return sortPlannedExercises(exercises).map((item, index) => ({ ...item, order: index + 1 }));
}

function getExerciseName(exercises: Exercise[], exerciseId: string): string {
  return exercises.find((exercise) => exercise.id === exerciseId)?.name ?? 'Unknown exercise';
}

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<RoutineTemplate[]>(() => listRoutines());
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const [routineNameDraft, setRoutineNameDraft] = useState('');
  const [routineError, setRoutineError] = useState('');

  const [newPlannedExercise, setNewPlannedExercise] = useState<PlannedExerciseForm>(
    defaultPlannedExerciseForm
  );
  const [plannedExerciseError, setPlannedExerciseError] = useState('');

  const [editingPlannedExerciseId, setEditingPlannedExerciseId] = useState<string | null>(null);
  const [editingPlannedExerciseForm, setEditingPlannedExerciseForm] =
    useState<PlannedExerciseForm>(defaultPlannedExerciseForm);

  const exerciseLibrary = useMemo(() => listExercises(), [routines]);

  const selectedRoutine = useMemo(
    () => routines.find((routine) => routine.id === selectedRoutineId),
    [routines, selectedRoutineId]
  );

  const selectedDay = useMemo(
    () => selectedRoutine?.days.find((day) => day.id === selectedDayId),
    [selectedRoutine, selectedDayId]
  );

  function refreshRoutines(nextSelectedRoutineId?: string | null, nextSelectedDayId?: string | null): void {
    const nextRoutines = listRoutines();
    setRoutines(nextRoutines);
    setSelectedRoutineId(nextSelectedRoutineId === undefined ? selectedRoutineId : nextSelectedRoutineId);
    setSelectedDayId(nextSelectedDayId === undefined ? selectedDayId : nextSelectedDayId);

    const selected = nextRoutines.find(
      (routine) => routine.id === (nextSelectedRoutineId === undefined ? selectedRoutineId : nextSelectedRoutineId)
    );

    setRoutineNameDraft(selected?.name ?? '');
  }

  function handleCreateRoutine(): void {
    const name = window.prompt('Routine name');

    if (!name || !name.trim()) {
      return;
    }

    try {
      const routine = addRoutine({ name, days: [] });
      refreshRoutines(routine.id, null);
      setRoutineNameDraft(routine.name);
    } catch (error) {
      setRoutineError(error instanceof Error ? error.message : 'Could not create routine.');
    }
  }

  function selectRoutine(routine: RoutineTemplate): void {
    setSelectedRoutineId(routine.id);
    setSelectedDayId(sortDays(routine.days)[0]?.id ?? null);
    setRoutineNameDraft(routine.name);
    setRoutineError('');
    setPlannedExerciseError('');
  }

  function handleSaveRoutineName(): void {
    if (!selectedRoutine) {
      return;
    }

    try {
      const updated = updateRoutine(selectedRoutine.id, { name: routineNameDraft });
      refreshRoutines(updated.id, selectedDayId);
      setRoutineError('');
    } catch (error) {
      setRoutineError(error instanceof Error ? error.message : 'Could not update routine.');
    }
  }

  function handleDeleteRoutine(routine: RoutineTemplate): void {
    const isConfirmed = window.confirm(`Delete routine "${routine.name}"?`);

    if (!isConfirmed) {
      return;
    }

    removeRoutine(routine.id);

    if (selectedRoutineId === routine.id) {
      refreshRoutines(null, null);
      return;
    }

    refreshRoutines();
  }

  function handleAddDay(): void {
    if (!selectedRoutine) {
      return;
    }

    const dayName = window.prompt('Day name', `Day ${selectedRoutine.days.length + 1}`);

    if (!dayName || !dayName.trim()) {
      return;
    }

    const nextDays = normalizeDayOrder([
      ...selectedRoutine.days,
      {
        id: crypto.randomUUID(),
        name: dayName.trim(),
        order: selectedRoutine.days.length + 1,
        plannedExercises: []
      }
    ]);

    updateRoutine(selectedRoutine.id, { days: nextDays });
    const newDayId = nextDays[nextDays.length - 1]?.id ?? null;
    refreshRoutines(selectedRoutine.id, newDayId);
  }

  function handleRenameDay(day: DayTemplate): void {
    if (!selectedRoutine) {
      return;
    }

    const nextName = window.prompt('Rename day', day.name);

    if (!nextName || !nextName.trim()) {
      return;
    }

    const nextDays = selectedRoutine.days.map((currentDay) =>
      currentDay.id === day.id ? { ...currentDay, name: nextName.trim() } : currentDay
    );

    updateRoutine(selectedRoutine.id, { days: nextDays });
    refreshRoutines(selectedRoutine.id, day.id);
  }

  function handleDeleteDay(day: DayTemplate): void {
    if (!selectedRoutine) {
      return;
    }

    const isConfirmed = window.confirm(`Delete day "${day.name}"?`);

    if (!isConfirmed) {
      return;
    }

    const nextDays = normalizeDayOrder(selectedRoutine.days.filter((currentDay) => currentDay.id !== day.id));
    updateRoutine(selectedRoutine.id, { days: nextDays });
    const fallbackDayId = sortDays(nextDays)[0]?.id ?? null;
    refreshRoutines(selectedRoutine.id, selectedDayId === day.id ? fallbackDayId : selectedDayId);
  }

  function saveDay(nextDay: DayTemplate): void {
    if (!selectedRoutine) {
      return;
    }

    const nextDays = selectedRoutine.days.map((day) => (day.id === nextDay.id ? nextDay : day));
    updateRoutine(selectedRoutine.id, { days: normalizeDayOrder(nextDays) });
    refreshRoutines(selectedRoutine.id, nextDay.id);
  }

  function handleAddPlannedExercise(): void {
    if (!selectedDay) {
      return;
    }

    if (!newPlannedExercise.exerciseId) {
      setPlannedExerciseError('Select an exercise first.');
      return;
    }

    const parsedSets = Number(newPlannedExercise.targetSets);

    if (!Number.isFinite(parsedSets) || parsedSets <= 0) {
      setPlannedExerciseError('Target sets must be a positive number.');
      return;
    }

    if (!newPlannedExercise.targetReps.trim()) {
      setPlannedExerciseError('Target reps is required.');
      return;
    }

    const targetWeight = newPlannedExercise.targetWeight.trim()
      ? Number(newPlannedExercise.targetWeight)
      : undefined;

    if (targetWeight !== undefined && !Number.isFinite(targetWeight)) {
      setPlannedExerciseError('Target weight must be a valid number.');
      return;
    }

    const nextPlannedExercises = normalizePlannedExerciseOrder([
      ...selectedDay.plannedExercises,
      {
        id: crypto.randomUUID(),
        exerciseId: newPlannedExercise.exerciseId,
        targetSets: parsedSets,
        targetReps: newPlannedExercise.targetReps.trim(),
        targetWeight,
        notes: newPlannedExercise.notes.trim() || undefined,
        order: selectedDay.plannedExercises.length + 1
      }
    ]);

    saveDay({ ...selectedDay, plannedExercises: nextPlannedExercises });
    setNewPlannedExercise({
      ...defaultPlannedExerciseForm,
      exerciseId: newPlannedExercise.exerciseId
    });
    setPlannedExerciseError('');
  }

  function movePlannedExercise(itemId: string, direction: -1 | 1): void {
    if (!selectedDay) {
      return;
    }

    const ordered = sortPlannedExercises(selectedDay.plannedExercises);
    const index = ordered.findIndex((item) => item.id === itemId);

    if (index < 0) {
      return;
    }

    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= ordered.length) {
      return;
    }

    const next = [...ordered];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);

    saveDay({ ...selectedDay, plannedExercises: normalizePlannedExerciseOrder(next) });
  }

  function handleDeletePlannedExercise(item: PlannedExercise): void {
    if (!selectedDay) {
      return;
    }

    const isConfirmed = window.confirm(`Delete ${getExerciseName(exerciseLibrary, item.exerciseId)} from day?`);

    if (!isConfirmed) {
      return;
    }

    const next = normalizePlannedExerciseOrder(
      selectedDay.plannedExercises.filter((planned) => planned.id !== item.id)
    );

    saveDay({ ...selectedDay, plannedExercises: next });
  }

  function startEditPlannedExercise(item: PlannedExercise): void {
    setEditingPlannedExerciseId(item.id);
    setEditingPlannedExerciseForm({
      exerciseId: item.exerciseId,
      targetSets: String(item.targetSets),
      targetReps: item.targetReps,
      targetWeight: item.targetWeight === undefined ? '' : String(item.targetWeight),
      notes: item.notes ?? ''
    });
    setPlannedExerciseError('');
  }

  function handleSaveEditedPlannedExercise(item: PlannedExercise): void {
    if (!selectedDay) {
      return;
    }

    const parsedSets = Number(editingPlannedExerciseForm.targetSets);

    if (!Number.isFinite(parsedSets) || parsedSets <= 0) {
      setPlannedExerciseError('Target sets must be a positive number.');
      return;
    }

    if (!editingPlannedExerciseForm.targetReps.trim()) {
      setPlannedExerciseError('Target reps is required.');
      return;
    }

    const targetWeight = editingPlannedExerciseForm.targetWeight.trim()
      ? Number(editingPlannedExerciseForm.targetWeight)
      : undefined;

    if (targetWeight !== undefined && !Number.isFinite(targetWeight)) {
      setPlannedExerciseError('Target weight must be a valid number.');
      return;
    }

    const next = selectedDay.plannedExercises.map((planned) => {
      if (planned.id !== item.id) {
        return planned;
      }

      return {
        ...planned,
        exerciseId: editingPlannedExerciseForm.exerciseId,
        targetSets: parsedSets,
        targetReps: editingPlannedExerciseForm.targetReps.trim(),
        targetWeight,
        notes: editingPlannedExerciseForm.notes.trim() || undefined
      };
    });

    saveDay({ ...selectedDay, plannedExercises: normalizePlannedExerciseOrder(next) });
    setEditingPlannedExerciseId(null);
    setPlannedExerciseError('');
  }

  return (
    <section className="page">
      <div className="section-head">
        <h1>Routines</h1>
        <Button type="button" onClick={handleCreateRoutine}>
          Create Routine
        </Button>
      </div>

      <div className="card form-stack">
        <h2 className="section-title">Routine Templates</h2>
        {routines.length === 0 ? <p className="exercise-meta">No routines yet.</p> : null}
        {routines.map((routine) => (
          <article className="routine-row" key={routine.id}>
            <button
              className={routine.id === selectedRoutineId ? 'routine-select active' : 'routine-select'}
              type="button"
              onClick={() => selectRoutine(routine)}
            >
              {routine.name}
            </button>
            <Button type="button" variant="danger" onClick={() => handleDeleteRoutine(routine)}>
              Delete
            </Button>
          </article>
        ))}
      </div>

      {selectedRoutine ? (
        <div className="card form-stack">
          <h2 className="section-title">Routine Editor</h2>
          <TextInput
            label="Routine Name"
            name="routineName"
            value={routineNameDraft}
            onChange={(event) => setRoutineNameDraft(event.target.value)}
          />
          <Button type="button" onClick={handleSaveRoutineName}>
            Save Name
          </Button>
          {routineError ? <p className="form-error">{routineError}</p> : null}

          <div className="section-head compact">
            <h3 className="subsection-title">Days</h3>
            <Button type="button" variant="secondary" onClick={handleAddDay}>
              Add Day
            </Button>
          </div>

          {sortDays(selectedRoutine.days).map((day) => (
            <article className="routine-row" key={day.id}>
              <button
                className={day.id === selectedDayId ? 'routine-select active' : 'routine-select'}
                type="button"
                onClick={() => setSelectedDayId(day.id)}
              >
                {day.name}
              </button>
              <div className="mini-actions">
                <Button type="button" variant="secondary" onClick={() => handleRenameDay(day)}>
                  Rename
                </Button>
                <Button type="button" variant="danger" onClick={() => handleDeleteDay(day)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {selectedRoutine && selectedDay ? (
        <div className="card form-stack">
          <h2 className="section-title">Day Editor: {selectedDay.name}</h2>

          {exerciseLibrary.length === 0 ? (
            <p className="form-error">Add exercises first before planning a day.</p>
          ) : (
            <div className="form-stack">
              <label className="input-field" htmlFor="plannedExerciseSelect">
                <span className="input-label">Exercise</span>
                <select
                  id="plannedExerciseSelect"
                  className="text-input"
                  value={newPlannedExercise.exerciseId}
                  onChange={(event) =>
                    setNewPlannedExercise((prev) => ({ ...prev, exerciseId: event.target.value }))
                  }
                >
                  <option value="">Select exercise</option>
                  {exerciseLibrary.map((exercise) => (
                    <option value={exercise.id} key={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="compact-grid">
                <TextInput
                  label="Sets"
                  name="targetSets"
                  inputMode="numeric"
                  value={newPlannedExercise.targetSets}
                  onChange={(event) =>
                    setNewPlannedExercise((prev) => ({ ...prev, targetSets: event.target.value }))
                  }
                />
                <TextInput
                  label="Reps"
                  name="targetReps"
                  value={newPlannedExercise.targetReps}
                  onChange={(event) =>
                    setNewPlannedExercise((prev) => ({ ...prev, targetReps: event.target.value }))
                  }
                />
              </div>
              <div className="compact-grid">
                <TextInput
                  label="Weight"
                  name="targetWeight"
                  inputMode="decimal"
                  value={newPlannedExercise.targetWeight}
                  onChange={(event) =>
                    setNewPlannedExercise((prev) => ({ ...prev, targetWeight: event.target.value }))
                  }
                />
                <TextInput
                  label="Notes"
                  name="plannedNotes"
                  value={newPlannedExercise.notes}
                  onChange={(event) =>
                    setNewPlannedExercise((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </div>
              {plannedExerciseError ? <p className="form-error">{plannedExerciseError}</p> : null}
              <Button type="button" onClick={handleAddPlannedExercise}>
                Add Planned Exercise
              </Button>
            </div>
          )}

          <div className="exercise-list" role="list">
            {sortPlannedExercises(selectedDay.plannedExercises).map((item, index, items) => {
              const isEditing = editingPlannedExerciseId === item.id;

              return (
                <article className="card exercise-row" key={item.id} role="listitem">
                  {isEditing ? (
                    <div className="form-stack">
                      <label className="input-field" htmlFor={`edit-exercise-${item.id}`}>
                        <span className="input-label">Exercise</span>
                        <select
                          id={`edit-exercise-${item.id}`}
                          className="text-input"
                          value={editingPlannedExerciseForm.exerciseId}
                          onChange={(event) =>
                            setEditingPlannedExerciseForm((prev) => ({
                              ...prev,
                              exerciseId: event.target.value
                            }))
                          }
                        >
                          {exerciseLibrary.map((exercise) => (
                            <option value={exercise.id} key={exercise.id}>
                              {exercise.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="compact-grid">
                        <TextInput
                          label="Sets"
                          name={`edit-sets-${item.id}`}
                          inputMode="numeric"
                          value={editingPlannedExerciseForm.targetSets}
                          onChange={(event) =>
                            setEditingPlannedExerciseForm((prev) => ({
                              ...prev,
                              targetSets: event.target.value
                            }))
                          }
                        />
                        <TextInput
                          label="Reps"
                          name={`edit-reps-${item.id}`}
                          value={editingPlannedExerciseForm.targetReps}
                          onChange={(event) =>
                            setEditingPlannedExerciseForm((prev) => ({
                              ...prev,
                              targetReps: event.target.value
                            }))
                          }
                        />
                      </div>
                      <div className="compact-grid">
                        <TextInput
                          label="Weight"
                          name={`edit-weight-${item.id}`}
                          inputMode="decimal"
                          value={editingPlannedExerciseForm.targetWeight}
                          onChange={(event) =>
                            setEditingPlannedExerciseForm((prev) => ({
                              ...prev,
                              targetWeight: event.target.value
                            }))
                          }
                        />
                        <TextInput
                          label="Notes"
                          name={`edit-notes-${item.id}`}
                          value={editingPlannedExerciseForm.notes}
                          onChange={(event) =>
                            setEditingPlannedExerciseForm((prev) => ({
                              ...prev,
                              notes: event.target.value
                            }))
                          }
                        />
                      </div>
                      <div className="row-actions">
                        <Button type="button" onClick={() => handleSaveEditedPlannedExercise(item)}>
                          Save
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setEditingPlannedExerciseId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="exercise-name">{getExerciseName(exerciseLibrary, item.exerciseId)}</p>
                        <p className="exercise-meta">
                          {item.targetSets} sets • {item.targetReps}
                          {item.targetWeight !== undefined ? ` • ${item.targetWeight} kg` : ''}
                          {item.notes ? ` • ${item.notes}` : ''}
                        </p>
                      </div>
                      <div className="row-actions">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={index === 0}
                          onClick={() => movePlannedExercise(item.id, -1)}
                        >
                          Move Up
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={index === items.length - 1}
                          onClick={() => movePlannedExercise(item.id, 1)}
                        >
                          Move Down
                        </Button>
                      </div>
                      <div className="row-actions">
                        <Button type="button" variant="secondary" onClick={() => startEditPlannedExercise(item)}>
                          Edit
                        </Button>
                        <Button type="button" variant="danger" onClick={() => handleDeletePlannedExercise(item)}>
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}

            {selectedDay.plannedExercises.length === 0 ? (
              <article className="card exercise-empty">No planned exercises yet.</article>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
