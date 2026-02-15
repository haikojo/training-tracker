import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { addSession, getSessionById, removeSession } from '../../data/repos/sessionsRepo';
import { listExercises } from '../../data/repos/exercisesRepo';
import { buildRepeatSessionInput, getExerciseTotals, getSessionTotalVolume } from './logic';

export default function HistoryDetailScreen() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = sessionId ? getSessionById(sessionId) : undefined;

  const exerciseNameMap = useMemo(() => {
    const map = new Map<string, string>();
    listExercises().forEach((exercise) => map.set(exercise.id, exercise.name));
    return map;
  }, []);

  function handleRepeatWorkout(): void {
    if (!session) {
      return;
    }

    const repeated = addSession(buildRepeatSessionInput(session));
    navigate(`/workout/${repeated.id}`);
  }

  function handleDeleteWorkout(): void {
    if (!session) {
      return;
    }

    const isConfirmed = window.confirm('Delete this workout from history?');

    if (!isConfirmed) {
      return;
    }

    removeSession(session.id);
    navigate('/history', { replace: true });
  }

  if (!sessionId) {
    return (
      <section className="page">
        <h1>Workout Detail</h1>
        <article className="card form-stack">
          <p className="form-error">Missing session id.</p>
          <Link className="inline-link" to="/history">
            Back to history
          </Link>
        </article>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="page">
        <h1>Workout Detail</h1>
        <article className="card form-stack">
          <p className="form-error">Session not found.</p>
          <Link className="inline-link" to="/history">
            Back to history
          </Link>
        </article>
      </section>
    );
  }

  const sessionTotalVolume = getSessionTotalVolume(session);

  return (
    <section className="page">
      <div className="section-head">
        <h1>{session.name}</h1>
        <Link className="inline-link" to="/history">
          Back
        </Link>
      </div>
      <p className="exercise-meta">{new Date(session.date).toLocaleString()}</p>

      <article className="card form-stack">
        {session.durationMinutes !== undefined ? <p>Duration: {session.durationMinutes} min</p> : null}
        {session.effort !== undefined ? <p>Effort: {session.effort}/10</p> : null}
        {session.notes ? <p>Notes: {session.notes}</p> : null}
        <p>Total Volume: {sessionTotalVolume.toLocaleString()} kg</p>
      </article>

      <div className="exercise-list" role="list">
        {session.entries.map((entry, index) => {
          const totals = getExerciseTotals(entry);

          return (
            <article className="card exercise-row" key={entry.id} role="listitem">
              <p className="exercise-name">
                {index + 1}. {exerciseNameMap.get(entry.exerciseId) ?? 'Unknown exercise'}
              </p>
              <p className="exercise-meta">
                {totals.totalSets} sets · {totals.totalReps} reps · {totals.totalVolume.toLocaleString()} kg
              </p>

              <div className="sets-stack">
                {entry.sets.map((set, setIndex) => (
                  <p className="exercise-meta" key={set.id}>
                    Set {setIndex + 1}: {set.reps} reps x {set.weight} kg
                  </p>
                ))}
                {entry.sets.length === 0 ? <p className="exercise-meta">No sets logged.</p> : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="row-actions">
        <Button type="button" onClick={handleRepeatWorkout}>
          Repeat Workout
        </Button>
        <Button type="button" variant="danger" onClick={handleDeleteWorkout}>
          Delete Workout
        </Button>
      </div>
    </section>
  );
}
