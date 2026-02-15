import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { addSession, getLastSessionForTemplateDay } from '../../data/repos/sessionsRepo';
import { listRoutines } from '../../data/repos/routinesRepo';
import type { DayTemplate } from '../../domain/types';
import { buildFreshSessionInput, buildSessionInputFromLast } from './sessionFactory';

export default function StartWorkoutScreen() {
  const navigate = useNavigate();
  const routines = useMemo(() => listRoutines(), []);

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(() => routines[0]?.id ?? '');
  const selectedRoutine = routines.find((routine) => routine.id === selectedRoutineId);
  const orderedDays = useMemo(
    () => [...(selectedRoutine?.days ?? [])].sort((a, b) => a.order - b.order),
    [selectedRoutine]
  );

  const [selectedDayId, setSelectedDayId] = useState<string>(() => orderedDays[0]?.id ?? '');
  const selectedDay = orderedDays.find((day) => day.id === selectedDayId) ?? orderedDays[0];

  function handleRoutineChange(routineId: string): void {
    setSelectedRoutineId(routineId);
    const nextRoutine = routines.find((routine) => routine.id === routineId);
    const nextDay = [...(nextRoutine?.days ?? [])].sort((a, b) => a.order - b.order)[0];
    setSelectedDayId(nextDay?.id ?? '');
  }

  function startWorkout(day: DayTemplate): void {
    const session = addSession(buildFreshSessionInput(day, selectedRoutine?.id));
    navigate(`/workout/${session.id}`);
  }

  function startFromLastTime(day: DayTemplate): void {
    const lastSession = getLastSessionForTemplateDay(day.id);

    if (!lastSession) {
      const session = addSession(buildFreshSessionInput(day, selectedRoutine?.id));
      navigate(`/workout/${session.id}`, {
        state: { notice: 'No previous session found; started fresh.' }
      });
      return;
    }

    const session = addSession(buildSessionInputFromLast(day, lastSession, selectedRoutine?.id));
    navigate(`/workout/${session.id}`);
  }

  if (routines.length === 0) {
    return (
      <section className="page">
        <ScreenHeader
          title="Start Workout"
          subtitle="Choose a template day"
          action={
            <Link className="inline-link" to="/settings">
              Settings
            </Link>
          }
        />
        <article className="card">Create a routine first, then start a workout.</article>
      </section>
    );
  }

  return (
    <section className="page">
      <ScreenHeader
        title="Start Workout"
        subtitle="Start fresh or use last time as baseline"
        action={
          <Link className="inline-link" to="/settings">
            Settings
          </Link>
        }
      />

      <article className="card form-stack">
        <label className="input-field" htmlFor="routineTemplateSelect">
          <span className="input-label">Routine Template</span>
          <select
            id="routineTemplateSelect"
            className="text-input"
            value={selectedRoutineId}
            onChange={(event) => handleRoutineChange(event.target.value)}
          >
            {routines.map((routine) => (
              <option key={routine.id} value={routine.id}>
                {routine.name}
              </option>
            ))}
          </select>
        </label>

        <label className="input-field" htmlFor="dayTemplateSelect">
          <span className="input-label">Day Template</span>
          <select
            id="dayTemplateSelect"
            className="text-input"
            value={selectedDay?.id ?? ''}
            onChange={(event) => setSelectedDayId(event.target.value)}
            disabled={orderedDays.length === 0}
          >
            {orderedDays.map((day) => (
              <option key={day.id} value={day.id}>
                {day.name}
              </option>
            ))}
          </select>
        </label>

        <Button type="button" onClick={() => selectedDay && startWorkout(selectedDay)} disabled={!selectedDay}>
          Start Workout
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => selectedDay && startFromLastTime(selectedDay)}
          disabled={!selectedDay}
        >
          Start from last time
        </Button>
      </article>
    </section>
  );
}
