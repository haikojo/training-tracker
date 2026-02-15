import type { PlannedExercise, SessionExercise, SessionSet, WorkoutSession } from '../../domain/types';

const MAX_REPS = 999;
const MAX_WEIGHT = 9999;

export interface PlannedTarget {
  targetSets: number;
  targetReps: string;
  targetWeight?: number;
}

export interface SetDefaultsInput {
  currentSets: SessionSet[];
  lastExerciseSession?: WorkoutSession;
  exerciseId: string;
  plannedTarget?: PlannedTarget;
}

function toNumberOrUndefined(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function deriveDefaultReps(targetReps?: string): number {
  if (!targetReps) {
    return 10;
  }

  const normalized = targetReps.trim().toUpperCase();

  if (normalized === 'AMRAP') {
    return 10;
  }

  if (normalized.includes('-')) {
    const [start] = normalized.split('-');
    const parsed = toNumberOrUndefined(start.trim());
    return parsed !== undefined ? Math.max(0, Math.round(parsed)) : 10;
  }

  const parsed = toNumberOrUndefined(normalized);
  return parsed !== undefined ? Math.max(0, Math.round(parsed)) : 10;
}

export function formatPlannedTarget(target?: PlannedTarget): string | null {
  if (!target) {
    return null;
  }

  const pieces = [`${target.targetSets} sets`, `${target.targetReps} reps`];

  if (target.targetWeight !== undefined) {
    pieces.push(`${target.targetWeight} kg`);
  }

  return pieces.join(' · ');
}

export function getPlannedTargetForExercise(
  plannedExercises: PlannedExercise[],
  exerciseId: string
): PlannedTarget | undefined {
  const planned = plannedExercises.find((item) => item.exerciseId === exerciseId);

  if (!planned) {
    return undefined;
  }

  return {
    targetSets: planned.targetSets,
    targetReps: planned.targetReps,
    targetWeight: planned.targetWeight
  };
}

function findLastSetInSessionForExercise(session: WorkoutSession, exerciseId: string): SessionSet | undefined {
  const entry = session.entries.find((item) => item.exerciseId === exerciseId);

  if (!entry || entry.sets.length === 0) {
    return undefined;
  }

  return entry.sets[entry.sets.length - 1];
}

function roundWeight(value: number): number {
  return Math.round(value * 100) / 100;
}

export function clampReps(value: number): number {
  return Math.min(MAX_REPS, Math.max(0, Math.round(value)));
}

export function clampWeight(value: number): number {
  return roundWeight(Math.min(MAX_WEIGHT, Math.max(0, value)));
}

export function getNewSetDefaults(input: SetDefaultsInput): Pick<SessionSet, 'reps' | 'weight'> {
  const withinExerciseLastSet = input.currentSets[input.currentSets.length - 1];

  if (withinExerciseLastSet) {
    return {
      reps: clampReps(withinExerciseLastSet.reps),
      weight: clampWeight(withinExerciseLastSet.weight)
    };
  }

  if (input.lastExerciseSession) {
    const previousSet = findLastSetInSessionForExercise(input.lastExerciseSession, input.exerciseId);

    if (previousSet) {
      return {
        reps: clampReps(previousSet.reps),
        weight: clampWeight(previousSet.weight)
      };
    }
  }

  return {
    reps: deriveDefaultReps(input.plannedTarget?.targetReps),
    weight: clampWeight(input.plannedTarget?.targetWeight ?? 0)
  };
}

export function copyLastSetDefaults(currentSets: SessionSet[]): Pick<SessionSet, 'reps' | 'weight'> | null {
  const lastSet = currentSets[currentSets.length - 1];

  if (!lastSet) {
    return null;
  }

  return {
    reps: clampReps(lastSet.reps),
    weight: clampWeight(lastSet.weight)
  };
}

export function updateEntryInSession(
  entries: SessionExercise[],
  entryId: string,
  updater: (entry: SessionExercise) => SessionExercise
): SessionExercise[] {
  return entries.map((entry) => (entry.id === entryId ? updater(entry) : entry));
}

export function updateSetInEntry(
  entry: SessionExercise,
  setId: string,
  updater: (set: SessionSet) => SessionSet
): SessionExercise {
  return {
    ...entry,
    sets: entry.sets.map((set) => (set.id === setId ? updater(set) : set))
  };
}
