import type { Exercise } from '../../domain/types';

export function toExerciseErrorMessage(error: unknown): string {
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

export function filterExercisesByName(exercises: Exercise[], searchTerm: string): Exercise[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) {
    return exercises;
  }

  return exercises.filter((exercise) => exercise.name.toLowerCase().includes(normalizedTerm));
}
