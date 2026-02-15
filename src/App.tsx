import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import ExercisesScreen from './features/exercises/ExercisesScreen';
import HistoryDetailScreen from './features/history/HistoryDetailScreen';
import HistoryScreen from './features/history/HistoryScreen';
import ProgressScreen from './features/progress/ProgressScreen';
import RoutinesScreen from './features/routines/RoutinesScreen';
import SettingsScreen from './features/settings/SettingsScreen';
import StartWorkoutScreen from './features/workout/StartWorkoutScreen';
import WorkoutLoggerScreen from './features/workout/WorkoutLoggerScreen';

const tabs = [
  { to: '/routines', label: 'Routines' },
  { to: '/start', label: 'Start Workout' },
  { to: '/progress', label: 'Progress' },
  { to: '/history', label: 'History' },
  { to: '/exercises', label: 'Exercises' }
];

export default function App() {
  return (
    <AppShell>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/routines" replace />} />
          <Route path="/routines" element={<RoutinesScreen />} />
          <Route path="/start" element={<StartWorkoutScreen />} />
          <Route path="/start-workout" element={<Navigate to="/start" replace />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/workout/:sessionId" element={<WorkoutLoggerScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/history/:sessionId" element={<HistoryDetailScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
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
    </AppShell>
  );
}
