import type { ExerciseId, WorkoutSession } from '../../domain/types';

export type ProgressMetric = 'best-set-weight' | 'volume-per-workout';
export type ProgressRange = '1M' | '3M' | '6M' | 'ALL';

export interface ProgressPoint {
  date: string;
  timestamp: number;
  value: number;
  sessionId: string;
}

function hasDoneSets(sets: WorkoutSession['entries'][number]['sets']): boolean {
  return sets.some((set) => Boolean(set.completedAt));
}

function getBestSetWeight(sets: WorkoutSession['entries'][number]['sets']): number {
  const relevantSets = hasDoneSets(sets) ? sets.filter((set) => Boolean(set.completedAt)) : sets;

  if (relevantSets.length === 0) {
    return 0;
  }

  return relevantSets.reduce((max, set) => Math.max(max, set.weight), 0);
}

function getVolume(sets: WorkoutSession['entries'][number]['sets']): number {
  return sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
}

function getRangeStartDate(range: ProgressRange, now: Date): Date | null {
  if (range === 'ALL') {
    return null;
  }

  const rangeStart = new Date(now);

  if (range === '1M') {
    rangeStart.setMonth(rangeStart.getMonth() - 1);
  }

  if (range === '3M') {
    rangeStart.setMonth(rangeStart.getMonth() - 3);
  }

  if (range === '6M') {
    rangeStart.setMonth(rangeStart.getMonth() - 6);
  }

  return rangeStart;
}

function getEntryForExercise(session: WorkoutSession, exerciseId: ExerciseId) {
  return session.entries.find((entry) => entry.exerciseId === exerciseId);
}

export function computeProgressSeries(
  sessions: WorkoutSession[],
  exerciseId: ExerciseId,
  metric: ProgressMetric,
  range: ProgressRange,
  now = new Date()
): ProgressPoint[] {
  const rangeStart = getRangeStartDate(range, now);

  return [...sessions]
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .filter((session) => {
      if (!rangeStart) {
        return true;
      }

      return Date.parse(session.date) >= rangeStart.getTime();
    })
    .map((session) => {
      const entry = getEntryForExercise(session, exerciseId);

      if (!entry) {
        return null;
      }

      const value = metric === 'best-set-weight' ? getBestSetWeight(entry.sets) : getVolume(entry.sets);

      return {
        date: session.date,
        timestamp: Date.parse(session.date),
        value,
        sessionId: session.id
      } satisfies ProgressPoint;
    })
    .filter((point): point is ProgressPoint => point !== null);
}

export function formatMetricValue(metric: ProgressMetric, value: number): string {
  if (metric === 'best-set-weight') {
    return `${value.toFixed(1).replace(/\.0$/, '')} kg`;
  }

  return `${Math.round(value).toLocaleString()} vol`;
}
