import { Link } from 'react-router-dom';
import { listSessions } from '../../data/repos/sessionsRepo';
import { sortSessionsNewestFirst } from './logic';

export default function HistoryListScreen() {
  const sessions = sortSessionsNewestFirst(listSessions());

  return (
    <section className="page">
      <h1>History</h1>

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
                <p className="exercise-meta">
                  {session.durationMinutes !== undefined ? `${session.durationMinutes} min` : 'Duration -'}
                  {' · '}
                  {session.effort !== undefined ? `${session.effort}/10` : 'Effort -'}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
