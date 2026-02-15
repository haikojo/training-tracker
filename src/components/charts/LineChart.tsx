import { useMemo, useRef, useState } from 'react';

export interface LineChartPoint {
  x: number;
  label: string;
  value: number;
  valueLabel: string;
}

interface LineChartProps {
  points: LineChartPoint[];
}

interface PlotPoint extends LineChartPoint {
  px: number;
  py: number;
}

const WIDTH = 640;
const HEIGHT = 220;
const PAD_X = 28;
const PAD_Y = 22;

function formatAxisValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return Math.round(value).toLocaleString();
  }

  return value.toFixed(1).replace(/\.0$/, '');
}

export function LineChart({ points }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const plot = useMemo(() => {
    if (points.length === 0) {
      return {
        path: '',
        plottedPoints: [] as PlotPoint[],
        minY: 0,
        maxY: 0,
        midYTop: 0,
        midYBottom: 0
      };
    }

    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.value));
    const maxY = Math.max(...points.map((point) => point.value));

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const plottedPoints = points.map((point) => {
      const px = PAD_X + ((point.x - minX) / rangeX) * (WIDTH - PAD_X * 2);
      const py = HEIGHT - PAD_Y - ((point.value - minY) / rangeY) * (HEIGHT - PAD_Y * 2);

      return {
        ...point,
        px,
        py
      };
    });

    const path = plottedPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.px.toFixed(2)} ${point.py.toFixed(2)}`)
      .join(' ');

    const midYTop = PAD_Y + (HEIGHT - PAD_Y * 2) * 0.33;
    const midYBottom = PAD_Y + (HEIGHT - PAD_Y * 2) * 0.66;

    return { path, plottedPoints, minY, maxY, midYTop, midYBottom };
  }, [points]);

  function updateActiveIndex(clientX: number): void {
    if (!svgRef.current || plot.plottedPoints.length === 0) {
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;

    const nearestIndex = plot.plottedPoints.reduce(
      (closest, point, index) => {
        const distance = Math.abs(point.px - x);

        if (distance < closest.distance) {
          return { index, distance };
        }

        return closest;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    ).index;

    setActiveIndex(nearestIndex);
  }

  const activePoint = activeIndex === null ? null : plot.plottedPoints[activeIndex];

  const latestIndex = plot.plottedPoints.length - 1;

  return (
    <div className="line-chart">
      <svg
        ref={svgRef}
        className="line-chart-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Progress line chart"
        onPointerMove={(event) => updateActiveIndex(event.clientX)}
        onPointerDown={(event) => updateActiveIndex(event.clientX)}
        onPointerLeave={() => setActiveIndex(null)}
      >
        <line className="line-chart-guide" x1={PAD_X} y1={plot.midYTop} x2={WIDTH - PAD_X} y2={plot.midYTop} />
        <line className="line-chart-guide" x1={PAD_X} y1={plot.midYBottom} x2={WIDTH - PAD_X} y2={plot.midYBottom} />
        <line className="line-chart-axis" x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} />
        <text className="line-chart-y-label" x={2} y={PAD_Y + 2}>
          {formatAxisValue(plot.maxY)}
        </text>
        <text className="line-chart-y-label" x={2} y={HEIGHT - PAD_Y}>
          {formatAxisValue(plot.minY)}
        </text>

        {plot.path ? <path className="line-chart-line" d={plot.path} /> : null}

        {plot.plottedPoints.map((point, index) => (
          <circle
            key={`${point.x}-${point.value}`}
            className={[
              'line-chart-point',
              index === activeIndex ? 'active' : '',
              index === latestIndex ? 'latest' : ''
            ]
              .filter(Boolean)
              .join(' ')}
            cx={point.px}
            cy={point.py}
            r={index === activeIndex ? 5.4 : index === latestIndex ? 4.7 : 3.5}
          />
        ))}
      </svg>

      {activePoint ? (
        <div className="line-chart-tooltip" role="status" aria-live="polite">
          <span>{activePoint.label}</span>
          <strong>{activePoint.valueLabel}</strong>
        </div>
      ) : null}
    </div>
  );
}
