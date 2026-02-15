import { FormEvent, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import type { Exercise } from '../../domain/types';
import {
  addExercise,
  listExercises,
  removeExercise,
  updateExercise
} from '../../data/repos/exercisesRepo';

interface ExerciseFormState {
  name: string;
  muscleGroup: string;
  equipment: string;
}

const initialFormState: ExerciseFormState = {
  name: '',
  muscleGroup: '',
  equipment: ''
};

function toFriendlyErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Could not save exercise. Please try again.';
  }

  if (error.message === 'Exercise name cannot be empty.') {
    return 'Please enter an exercise name.';
  }

  if (error.message === 'Exercise name must be unique.') {
    return 'An exercise with this name already exists.';
  }

  return error.message;
}

export default function ExercisesScreen() {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [exercises, setExercises] = useState<Exercise[]>(() => listExercises());
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddForm, setQuickAddForm] = useState<ExerciseFormState>(initialFormState);
  const [quickAddError, setQuickAddError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ExerciseFormState>(initialFormState);
  const [editError, setEditError] = useState('');

  const filteredExercises = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return exercises;
    }

    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(normalizedTerm));
  }, [exercises, searchTerm]);

  function refreshExercises(): void {
    setExercises(listExercises());
  }

  function handleQuickAddSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setQuickAddError('');

    try {
      addExercise({
        name: quickAddForm.name,
        muscleGroup: quickAddForm.muscleGroup,
        equipment: quickAddForm.equipment
      });

      refreshExercises();
      setQuickAddForm(initialFormState);
      nameInputRef.current?.focus();
    } catch (error) {
      setQuickAddError(toFriendlyErrorMessage(error));
    }
  }

  function startEditing(exercise: Exercise): void {
    setEditingId(exercise.id);
    setEditError('');
    setEditForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup ?? '',
      equipment: exercise.equipment ?? ''
    });
  }

  function cancelEditing(): void {
    setEditingId(null);
    setEditError('');
    setEditForm(initialFormState);
  }

  function handleEditSave(exerciseId: string): void {
    setEditError('');

    try {
      updateExercise(exerciseId, {
        name: editForm.name,
        muscleGroup: editForm.muscleGroup,
        equipment: editForm.equipment
      });

      refreshExercises();
      cancelEditing();
    } catch (error) {
      setEditError(toFriendlyErrorMessage(error));
    }
  }

  function handleDelete(exercise: Exercise): void {
    const isConfirmed = window.confirm(`Delete "${exercise.name}"?`);

    if (!isConfirmed) {
      return;
    }

    removeExercise(exercise.id);
    refreshExercises();

    if (editingId === exercise.id) {
      cancelEditing();
    }
  }

  return (
    <section className="page">
      <h1>Exercises</h1>

      <form className="card form-stack" onSubmit={handleQuickAddSubmit}>
        <h2 className="section-title">Quick Add</h2>
        <TextInput
          label="Name"
          name="quickAddName"
          placeholder="e.g. Incline Dumbbell Press"
          value={quickAddForm.name}
          onChange={(event) => setQuickAddForm((prev) => ({ ...prev, name: event.target.value }))}
          ref={nameInputRef}
        />
        <TextInput
          label="Muscle Group (optional)"
          name="quickAddMuscleGroup"
          placeholder="e.g. Chest"
          value={quickAddForm.muscleGroup}
          onChange={(event) =>
            setQuickAddForm((prev) => ({ ...prev, muscleGroup: event.target.value }))
          }
        />
        <TextInput
          label="Equipment (optional)"
          name="quickAddEquipment"
          placeholder="e.g. Dumbbells"
          value={quickAddForm.equipment}
          onChange={(event) =>
            setQuickAddForm((prev) => ({ ...prev, equipment: event.target.value }))
          }
        />
        {quickAddError ? <p className="form-error">{quickAddError}</p> : null}
        <Button type="submit">Add Exercise</Button>
      </form>

      <div className="card form-stack">
        <TextInput
          label="Search"
          name="exerciseSearch"
          placeholder="Search exercises"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="exercise-list" role="list">
        {filteredExercises.map((exercise) => {
          const isEditing = editingId === exercise.id;

          return (
            <article className="card exercise-row" key={exercise.id} role="listitem">
              {isEditing ? (
                <div className="form-stack">
                  <TextInput
                    label="Name"
                    name={`edit-name-${exercise.id}`}
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                  <TextInput
                    label="Muscle Group (optional)"
                    name={`edit-muscle-${exercise.id}`}
                    value={editForm.muscleGroup}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, muscleGroup: event.target.value }))
                    }
                  />
                  <TextInput
                    label="Equipment (optional)"
                    name={`edit-equipment-${exercise.id}`}
                    value={editForm.equipment}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, equipment: event.target.value }))
                    }
                  />
                  {editError ? <p className="form-error">{editError}</p> : null}
                  <div className="row-actions">
                    <Button type="button" onClick={() => handleEditSave(exercise.id)}>
                      Save
                    </Button>
                    <Button type="button" variant="secondary" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="exercise-name">{exercise.name}</p>
                    {exercise.muscleGroup || exercise.equipment ? (
                      <p className="exercise-meta">
                        {[exercise.muscleGroup, exercise.equipment].filter(Boolean).join(' • ')}
                      </p>
                    ) : null}
                  </div>
                  <div className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEditing(exercise)}>
                      Edit
                    </Button>
                    <Button type="button" variant="danger" onClick={() => handleDelete(exercise)}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </article>
          );
        })}

        {filteredExercises.length === 0 ? (
          <article className="card exercise-empty">No exercises found.</article>
        ) : null}
      </div>
    </section>
  );
}
