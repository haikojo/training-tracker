import type { RoutineTemplate, RoutineTemplateId } from '../../domain/types';
import { loadJSON, saveJSON } from '../storage';

const ROUTINES_KEY = 'training-tracker:v1:routines';

export interface AddRoutineInput {
  name: string;
  notes?: string;
  days: RoutineTemplate['days'];
}

export interface UpdateRoutineInput {
  name?: string;
  notes?: string;
  days?: RoutineTemplate['days'];
}

function nowIso(): string {
  return new Date().toISOString();
}

function assertNonEmptyName(name: string): void {
  if (name.trim().length === 0) {
    throw new Error('Routine name cannot be empty.');
  }
}

function listRawRoutines(): RoutineTemplate[] {
  return loadJSON<RoutineTemplate[]>(ROUTINES_KEY, []);
}

function saveRoutines(routines: RoutineTemplate[]): void {
  saveJSON(ROUTINES_KEY, routines);
}

export function listRoutines(): RoutineTemplate[] {
  return listRawRoutines();
}

export function addRoutine(input: AddRoutineInput): RoutineTemplate {
  assertNonEmptyName(input.name);

  const routines = listRawRoutines();
  const timestamp = nowIso();

  const routine: RoutineTemplate = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    notes: input.notes?.trim() || undefined,
    days: input.days,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  saveRoutines([...routines, routine]);
  return routine;
}

export function updateRoutine(id: RoutineTemplateId, input: UpdateRoutineInput): RoutineTemplate {
  const routines = listRawRoutines();
  const current = routines.find((routine) => routine.id === id);

  if (!current) {
    throw new Error('Routine not found.');
  }

  const nextName = input.name === undefined ? current.name : input.name;
  assertNonEmptyName(nextName);

  const updated: RoutineTemplate = {
    ...current,
    name: nextName.trim(),
    notes: input.notes === undefined ? current.notes : input.notes.trim() || undefined,
    days: input.days ?? current.days,
    updatedAt: nowIso()
  };

  saveRoutines(routines.map((routine) => (routine.id === id ? updated : routine)));
  return updated;
}

export function removeRoutine(id: RoutineTemplateId): void {
  const routines = listRawRoutines();
  saveRoutines(routines.filter((routine) => routine.id !== id));
}

export { ROUTINES_KEY };
