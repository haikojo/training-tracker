import type { DayTemplateId, ExerciseId, SessionExercise, WorkoutSession, WorkoutSessionId } from '../../domain/types';
import { loadJSON, saveJSON } from '../storage';

const SESSIONS_KEY = 'training-tracker:v1:sessions';

export interface AddSessionInput {
  date: string;
  name: string;
  templateDayId: DayTemplateId;
  entries: SessionExercise[];
  routineTemplateId?: string;
  durationMinutes?: number;
  effort?: number;
  notes?: string;
}

export interface UpdateSessionInput {
  date?: string;
  name?: string;
  templateDayId?: DayTemplateId;
  entries?: SessionExercise[];
  routineTemplateId?: string;
  durationMinutes?: number;
  effort?: number;
  notes?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeSession(raw: WorkoutSession): WorkoutSession {
  const templateDayId = raw.templateDayId ?? raw.dayTemplateId;

  if (!templateDayId) {
    throw new Error('Session is missing template day id.');
  }

  return {
    ...raw,
    date: raw.date ?? raw.startedAt ?? raw.createdAt,
    name: raw.name ?? 'Workout',
    templateDayId,
    entries: raw.entries ?? raw.exercises ?? [],
    dayTemplateId: raw.dayTemplateId ?? templateDayId,
    startedAt: raw.startedAt ?? raw.date ?? raw.createdAt,
    exercises: raw.exercises ?? raw.entries ?? []
  };
}

function listRawSessions(): WorkoutSession[] {
  const sessions = loadJSON<WorkoutSession[]>(SESSIONS_KEY, []);

  return sessions
    .map((session) => {
      try {
        return normalizeSession(session);
      } catch {
        return null;
      }
    })
    .filter((session): session is WorkoutSession => session !== null);
}

function saveSessions(sessions: WorkoutSession[]): void {
  saveJSON(SESSIONS_KEY, sessions);
}

function sortLatestFirst(sessions: WorkoutSession[]): WorkoutSession[] {
  return [...sessions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function listSessions(): WorkoutSession[] {
  return listRawSessions();
}

export function getSessionById(id: WorkoutSessionId): WorkoutSession | undefined {
  return listRawSessions().find((session) => session.id === id);
}

export function addSession(input: AddSessionInput): WorkoutSession {
  const sessions = listRawSessions();
  const timestamp = nowIso();

  const session: WorkoutSession = {
    id: crypto.randomUUID(),
    date: input.date,
    name: input.name.trim(),
    templateDayId: input.templateDayId,
    entries: input.entries,
    routineTemplateId: input.routineTemplateId,
    durationMinutes: input.durationMinutes,
    effort: input.effort,
    notes: input.notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    dayTemplateId: input.templateDayId,
    startedAt: input.date,
    exercises: input.entries
  };

  saveSessions([...sessions, session]);
  return session;
}

export function updateSession(id: WorkoutSessionId, input: UpdateSessionInput): WorkoutSession {
  const sessions = listRawSessions();
  const current = sessions.find((session) => session.id === id);

  if (!current) {
    throw new Error('Session not found.');
  }

  const updated: WorkoutSession = {
    ...current,
    date: input.date ?? current.date,
    name: input.name === undefined ? current.name : input.name.trim(),
    templateDayId: input.templateDayId ?? current.templateDayId,
    entries: input.entries ?? current.entries,
    routineTemplateId:
      input.routineTemplateId === undefined ? current.routineTemplateId : input.routineTemplateId,
    durationMinutes:
      input.durationMinutes === undefined ? current.durationMinutes : input.durationMinutes,
    effort: input.effort === undefined ? current.effort : input.effort,
    notes: input.notes === undefined ? current.notes : input.notes.trim() || undefined,
    updatedAt: nowIso()
  };

  updated.dayTemplateId = updated.templateDayId;
  updated.startedAt = updated.date;
  updated.exercises = updated.entries;

  saveSessions(sessions.map((session) => (session.id === id ? updated : session)));
  return updated;
}

export function removeSession(id: WorkoutSessionId): void {
  const sessions = listRawSessions();
  saveSessions(sessions.filter((session) => session.id !== id));
}

export function getLastSessionForTemplateDay(dayTemplateId: DayTemplateId): WorkoutSession | undefined {
  const sessions = listRawSessions().filter((session) => session.templateDayId === dayTemplateId);
  return sortLatestFirst(sessions)[0];
}

export function getLastSessionForExercise(exerciseId: ExerciseId): WorkoutSession | undefined {
  const sessions = listRawSessions().filter((session) =>
    session.entries.some((exercise) => exercise.exerciseId === exerciseId)
  );

  return sortLatestFirst(sessions)[0];
}

export { SESSIONS_KEY };
