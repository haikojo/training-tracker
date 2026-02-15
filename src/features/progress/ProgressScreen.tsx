import { useMemo, useState } from 'react';
import { LineChart } from '../../components/charts/LineChart';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { listExercises } from '../../data/repos/exercisesRepo';
import { listSessions } from '../../data/repos/sessionsRepo';
import type { Exercise } from '../../domain/types';
import {
  computeProgressSeries,
  formatMetricValue,
  type ProgressMetric,
  type ProgressRange
} from './logic';

const metricOptions: Array<{ value: ProgressMetric; label: string }> = [
  { value: 'best-set-weight', label: 'Best set (weight)' },
  { value: 'volume-per-workout', label: 'Volume (reps × weight) per workout' }
];

const rangeOptions: ProgressRange[] = ['1M', '3M', '6M', 'ALL'];

function toDateLabel(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProgressScreen() {
  const exercises = useMemo(() => listExercises(), []);
  const sessions = useMemo(() => listSessions(), []);

  const [exerciseId, setExerciseId] = useState<string>(exercises[0]?.id ?? '');
  const [metric, setMetric] = useState<ProgressMetric>('best-set-weight');
  const [range, setRange] = useState<ProgressRange>('3M');

  const selectedExercise: Exercise | undefined = exercises.find((exercise) => exercise.id === exerciseId);

  const series = useMemo(() => {
    if (!exerciseId) {
      return [];
    }

    return computeProgressSeries(sessions, exerciseId, metric, range);
  }, [exerciseId, metric, range, sessions]);

  const points = series.map((point) => ({
    x: point.timestamp,
    label: toDateLabel(point.date),
    value: point.value,
    valueLabel: formatMetricValue(metric, point.value)
  }));

  return (
    <section className="page">
      <ScreenHeader title="Progress" subtitle="Track historical exercise performance" />

      <article className="card form-stack">
        <label className="input-field" htmlFor="progress-exercise">
          <span className="input-label">Exercise</span>
          <select
            id="progress-exercise"
            className="text-input"
            value={exerciseId}
            onChange={(event) => setExerciseId(event.target.value)}
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>

        <label className="input-field" htmlFor="progress-metric">
          <span className="input-label">Metric</span>
          <select
            id="progress-metric"
            className="text-input"
            value={metric}
            onChange={(event) => setMetric(event.target.value as ProgressMetric)}
          >
            {metricOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="progress-range-row" role="group" aria-label="Time range">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={option === range ? 'progress-range-btn active' : 'progress-range-btn'}
              onClick={() => setRange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </article>

      <article className="card form-stack progress-chart-card">
        <h2 className="section-title">{selectedExercise ? selectedExercise.name : 'Progress chart'}</h2>

        {!exerciseId || exercises.length === 0 ? (
          <p className="exercise-meta">Add exercises first to view progress.</p>
        ) : points.length === 0 ? (
          <p className="exercise-meta">No session data for this exercise in the selected range.</p>
        ) : (
          <LineChart points={points} />
        )}
      </article>
    </section>
  );
}
