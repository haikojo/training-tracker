import type { AddSessionInput } from '../../data/repos/sessionsRepo';
import type { SessionExercise, SessionSet, WorkoutSession } from '../../domain/types';

export interface ExerciseTotals {
  totalSets: number;
  totalReps: number;
  totalVolume: number;
}

export function sortSessionsNewestFirst(sessions: WorkoutSession[]): WorkoutSession[] {
  return [...sessions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getExerciseTotals(entry: SessionExercise): ExerciseTotals {
  const totalSets = entry.sets.length;
  const totalReps = entry.sets.reduce((sum, set) => sum + set.reps, 0);
  const totalVolume = entry.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);

  return {
    totalSets,
    totalReps,
    totalVolume: Math.round(totalVolume * 100) / 100
  };
}

export function getSessionTotalVolume(session: WorkoutSession): number {
  const total = session.entries.reduce((sum, entry) => sum + getExerciseTotals(entry).totalVolume, 0);
  return Math.round(total * 100) / 100;
}

function cloneLastSet(entry: SessionExercise): SessionSet[] {
  const lastSet = entry.sets[entry.sets.length - 1];

  if (!lastSet) {
    return [];
  }

  return [
    {
      id: crypto.randomUUID(),
      reps: lastSet.reps,
      weight: lastSet.weight
    }
  ];
}

export function buildRepeatSessionInput(session: WorkoutSession): AddSessionInput {
  return {
    date: new Date().toISOString(),
    name: session.name,
    templateDayId: session.templateDayId,
    routineTemplateId: session.routineTemplateId,
    entries: session.entries.map((entry) => ({
      id: crypto.randomUUID(),
      exerciseId: entry.exerciseId,
      sets: cloneLastSet(entry)
    }))
  };
}
