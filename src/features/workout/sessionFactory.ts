import type { DayTemplate, SessionExercise, SessionSet, WorkoutSession } from '../../domain/types';
import type { AddSessionInput } from '../../data/repos/sessionsRepo';

function cloneSet(set: SessionSet): SessionSet {
  return {
    id: crypto.randomUUID(),
    reps: set.reps,
    weight: set.weight
  };
}

function createEmptyEntry(exerciseId: string): SessionExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId,
    sets: []
  };
}

export function buildFreshSessionInput(day: DayTemplate, routineTemplateId?: string): AddSessionInput {
  const orderedPlannedExercises = [...day.plannedExercises].sort((a, b) => a.order - b.order);

  return {
    date: new Date().toISOString(),
    name: day.name,
    templateDayId: day.id,
    routineTemplateId,
    entries: orderedPlannedExercises.map((planned) => createEmptyEntry(planned.exerciseId))
  };
}

export function buildSessionInputFromLast(
  day: DayTemplate,
  lastSession: WorkoutSession,
  routineTemplateId?: string
): AddSessionInput {
  const orderedPlannedExercises = [...day.plannedExercises].sort((a, b) => a.order - b.order);

  const clonedEntries = orderedPlannedExercises.map((planned) => {
    const previousEntry = lastSession.entries.find((entry) => entry.exerciseId === planned.exerciseId);

    return {
      id: crypto.randomUUID(),
      exerciseId: planned.exerciseId,
      sets: previousEntry ? previousEntry.sets.map(cloneSet) : []
    };
  });

  return {
    date: new Date().toISOString(),
    name: day.name,
    templateDayId: day.id,
    routineTemplateId,
    entries: clonedEntries
  };
}
