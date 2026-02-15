import type { DayTemplate, Exercise, PlannedExercise } from '../../domain/types';

export function sortDays(days: DayTemplate[]): DayTemplate[] {
  return [...days].sort((a, b) => a.order - b.order);
}

export function sortPlannedExercises(exercises: PlannedExercise[]): PlannedExercise[] {
  return [...exercises].sort((a, b) => a.order - b.order);
}

export function normalizeDayOrder(days: DayTemplate[]): DayTemplate[] {
  return sortDays(days).map((day, index) => ({ ...day, order: index + 1 }));
}

export function normalizePlannedExerciseOrder(exercises: PlannedExercise[]): PlannedExercise[] {
  return sortPlannedExercises(exercises).map((item, index) => ({ ...item, order: index + 1 }));
}

export function getExerciseName(exercises: Exercise[], exerciseId: string): string {
  return exercises.find((exercise) => exercise.id === exerciseId)?.name ?? 'Unknown exercise';
}
