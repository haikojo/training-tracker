import { Link } from 'react-router-dom';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { Pill } from '../../components/ui/Pill';
import { listSessions } from '../../data/repos/sessionsRepo';
import { sortSessionsNewestFirst } from './logic';

export default function HistoryListScreen() {
  const sessions = sortSessionsNewestFirst(listSessions());

  return (
    <section className="page">
      <ScreenHeader
        title="History"
        subtitle="Your completed sessions"
        action={
          <Link className="inline-link" to="/settings">
            Settings
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <article className="card form-stack">
          <p>No workouts logged yet.</p>
          <Link className="inline-link" to="/start">
            Start your first workout
          </Link>
        </article>
      ) : (
        <div className="exercise-list" role="list">
          {sessions.map((session) => (
            <Link className="history-row-link" to={`/history/${session.id}`} key={session.id} role="listitem">
              <article className="card exercise-row history-row">
                <p className="exercise-meta">{new Date(session.date).toLocaleString()}</p>
                <p className="exercise-name">{session.name}</p>
                <div className="history-meta-row">
                  {session.durationMinutes !== undefined ? <Pill>{session.durationMinutes} min</Pill> : <Pill>Duration -</Pill>}
                  {session.effort !== undefined ? <Pill tone="accent">{session.effort}/10</Pill> : <Pill>Effort -</Pill>}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
