export type ExerciseId = string;
export type RoutineTemplateId = string;
export type DayTemplateId = string;
export type PlannedExerciseId = string;
export type WorkoutSessionId = string;
export type SessionExerciseId = string;
export type SessionSetId = string;

export interface Exercise {
  id: ExerciseId;
  name: string;
  muscleGroup?: string;
  equipment?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannedExercise {
  id: PlannedExerciseId;
  exerciseId: ExerciseId;
  targetSets: number;
  targetReps: string;
  targetWeight?: number;
  notes?: string;
  order: number;
}

export interface DayTemplate {
  id: DayTemplateId;
  name: string;
  order: number;
  plannedExercises: PlannedExercise[];
}

export interface RoutineTemplate {
  id: RoutineTemplateId;
  name: string;
  notes?: string;
  days: DayTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionSet {
  id: SessionSetId;
  reps: number;
  weight: number;
  completedAt?: string;
}

export interface SessionExercise {
  id: SessionExerciseId;
  exerciseId: ExerciseId;
  sets: SessionSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: WorkoutSessionId;
  date: string;
  name: string;
  templateDayId: DayTemplateId;
  entries: SessionExercise[];
  routineTemplateId?: RoutineTemplateId;
  durationMinutes?: number;
  effort?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy compatibility fields for older stored sessions.
  dayTemplateId?: DayTemplateId;
  startedAt?: string;
  endedAt?: string;
  exercises?: SessionExercise[];
}
