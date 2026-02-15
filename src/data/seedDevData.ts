import type { DayTemplate, Exercise, RoutineTemplate, WorkoutSession } from '../domain/types';
import { saveJSON } from './storage';
import { EXERCISES_KEY } from './repos/exercisesRepo';
import { ROUTINES_KEY } from './repos/routinesRepo';
import { SESSIONS_KEY } from './repos/sessionsRepo';

const SEEDED_KEY = 'training-tracker:v1:seeded';

function nowIso(): string {
  return new Date().toISOString();
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function seedDevDataOnce(): void {
  if (!import.meta.env.DEV) {
    return;
  }

  if (localStorage.getItem(SEEDED_KEY) === 'true') {
    return;
  }

  const timestamp = nowIso();

  const exercises: Exercise[] = [
    { id: crypto.randomUUID(), name: 'Bench Press', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Overhead Press', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Triceps Pushdown', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Deadlift', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Barbell Row', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Pull-Up', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Back Squat', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Leg Press', createdAt: timestamp, updatedAt: timestamp },
    { id: crypto.randomUUID(), name: 'Romanian Deadlift', createdAt: timestamp, updatedAt: timestamp }
  ];

  const pushDay: DayTemplate = {
    id: crypto.randomUUID(),
    name: 'Push',
    order: 1,
    plannedExercises: [
      { id: crypto.randomUUID(), exerciseId: exercises[0].id, order: 1, targetSets: 3, targetReps: '6-10' },
      { id: crypto.randomUUID(), exerciseId: exercises[1].id, order: 2, targetSets: 3, targetReps: '6-10' },
      { id: crypto.randomUUID(), exerciseId: exercises[2].id, order: 3, targetSets: 3, targetReps: '10-15' }
    ]
  };

  const pullDay: DayTemplate = {
    id: crypto.randomUUID(),
    name: 'Pull',
    order: 2,
    plannedExercises: [
      { id: crypto.randomUUID(), exerciseId: exercises[3].id, order: 1, targetSets: 2, targetReps: '5-8' },
      { id: crypto.randomUUID(), exerciseId: exercises[4].id, order: 2, targetSets: 3, targetReps: '6-10' },
      { id: crypto.randomUUID(), exerciseId: exercises[5].id, order: 3, targetSets: 3, targetReps: '6-12' }
    ]
  };

  const legsDay: DayTemplate = {
    id: crypto.randomUUID(),
    name: 'Legs',
    order: 3,
    plannedExercises: [
      { id: crypto.randomUUID(), exerciseId: exercises[6].id, order: 1, targetSets: 3, targetReps: '5-8' },
      { id: crypto.randomUUID(), exerciseId: exercises[7].id, order: 2, targetSets: 3, targetReps: '10-15' },
      { id: crypto.randomUUID(), exerciseId: exercises[8].id, order: 3, targetSets: 3, targetReps: '8-12' }
    ]
  };

  const routine: RoutineTemplate = {
    id: crypto.randomUUID(),
    name: 'PPL',
    notes: 'Push / Pull / Legs',
    days: [pushDay, pullDay, legsDay],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const sampleSession: WorkoutSession = {
    id: crypto.randomUUID(),
    date: daysAgoIso(2),
    name: pushDay.name,
    templateDayId: pushDay.id,
    routineTemplateId: routine.id,
    dayTemplateId: pushDay.id,
    startedAt: daysAgoIso(2),
    endedAt: daysAgoIso(2),
    entries: [
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[0].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 60 },
          { id: crypto.randomUUID(), reps: 8, weight: 62.5 },
          { id: crypto.randomUUID(), reps: 6, weight: 65 }
        ]
      },
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[1].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 35 },
          { id: crypto.randomUUID(), reps: 8, weight: 37.5 }
        ]
      }
    ],
    exercises: [
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[0].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 60 },
          { id: crypto.randomUUID(), reps: 8, weight: 62.5 },
          { id: crypto.randomUUID(), reps: 6, weight: 65 }
        ]
      },
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[1].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 35 },
          { id: crypto.randomUUID(), reps: 8, weight: 37.5 }
        ]
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  saveJSON(EXERCISES_KEY, exercises);
  saveJSON(ROUTINES_KEY, [routine]);
  saveJSON(SESSIONS_KEY, [sampleSession]);
  localStorage.setItem(SEEDED_KEY, 'true');
}
