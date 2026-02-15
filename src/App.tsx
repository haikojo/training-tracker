import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import ExercisesScreen from './features/exercises/ExercisesScreen';
import HistoryDetailScreen from './features/history/HistoryDetailScreen';
import HistoryScreen from './features/history/HistoryScreen';
import RoutinesScreen from './features/routines/RoutinesScreen';
import StartWorkoutScreen from './features/workout/StartWorkoutScreen';
import WorkoutLoggerScreen from './features/workout/WorkoutLoggerScreen';

const tabs = [
  { to: '/routines', label: 'Routines' },
  { to: '/start', label: 'Start Workout' },
  { to: '/history', label: 'History' },
  { to: '/exercises', label: 'Exercises' }
];

export default function App() {
  return (
    <div className="app-shell">
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/routines" replace />} />
          <Route path="/routines" element={<RoutinesScreen />} />
          <Route path="/start" element={<StartWorkoutScreen />} />
          <Route path="/start-workout" element={<Navigate to="/start" replace />} />
          <Route path="/workout/:sessionId" element={<WorkoutLoggerScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/history/:sessionId" element={<HistoryDetailScreen />} />
          <Route path="/exercises" element={<ExercisesScreen />} />
        </Routes>
      </main>

      <nav className="tab-bar" aria-label="Main">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              isActive ? 'tab-link tab-link-active' : 'tab-link'
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
