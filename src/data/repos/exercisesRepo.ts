import type { Exercise, ExerciseId } from '../../domain/types';
import { loadJSON, saveJSON } from '../storage';

const EXERCISES_KEY = 'training-tracker:v1:exercises';

export interface AddExerciseInput {
  name: string;
  muscleGroup?: string;
  equipment?: string;
}

export interface UpdateExerciseInput {
  name?: string;
  muscleGroup?: string;
  equipment?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function assertNonEmptyName(name: string): void {
  if (name.trim().length === 0) {
    throw new Error('Exercise name cannot be empty.');
  }
}

function listRawExercises(): Exercise[] {
  return loadJSON<Exercise[]>(EXERCISES_KEY, []);
}

function saveExercises(exercises: Exercise[]): void {
  saveJSON(EXERCISES_KEY, exercises);
}

function assertUniqueName(exercises: Exercise[], name: string, ignoreId?: ExerciseId): void {
  const normalized = normalizeName(name);

  const duplicate = exercises.some(
    (exercise) => exercise.id !== ignoreId && normalizeName(exercise.name) === normalized
  );

  if (duplicate) {
    throw new Error('Exercise name must be unique.');
  }
}

export function listExercises(): Exercise[] {
  return listRawExercises();
}

export function addExercise(input: AddExerciseInput): Exercise {
  assertNonEmptyName(input.name);

  const exercises = listRawExercises();
  assertUniqueName(exercises, input.name);

  const timestamp = nowIso();
  const exercise: Exercise = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    muscleGroup: input.muscleGroup?.trim() || undefined,
    equipment: input.equipment?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  saveExercises([...exercises, exercise]);
  return exercise;
}

export function updateExercise(id: ExerciseId, input: UpdateExerciseInput): Exercise {
  const exercises = listRawExercises();
  const current = exercises.find((exercise) => exercise.id === id);

  if (!current) {
    throw new Error('Exercise not found.');
  }

  const nextName = input.name === undefined ? current.name : input.name;
  assertNonEmptyName(nextName);
  assertUniqueName(exercises, nextName, id);

  const updated: Exercise = {
    ...current,
    name: nextName.trim(),
    muscleGroup:
      input.muscleGroup === undefined ? current.muscleGroup : input.muscleGroup.trim() || undefined,
    equipment:
      input.equipment === undefined ? current.equipment : input.equipment.trim() || undefined,
    updatedAt: nowIso()
  };

  saveExercises(exercises.map((exercise) => (exercise.id === id ? updated : exercise)));
  return updated;
}

export function removeExercise(id: ExerciseId): void {
  const exercises = listRawExercises();
  saveExercises(exercises.filter((exercise) => exercise.id !== id));
}

export { EXERCISES_KEY };
