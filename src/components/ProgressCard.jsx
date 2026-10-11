import { useProgress } from '../context/ProgressContext.jsx';

export default function ProgressCard({ compact = false }) {
  const { stats } = useProgress();
  return (
    <div className="progress-card" title={`${stats.completed} of ${stats.available} available visualizations completed`}>
      <div>
        <strong>{compact ? `${stats.percent}%` : 'Your progress'}</strong>
        {!compact && (
          <span className="progress-card__detail">
            {' '}
            {stats.completed} of {stats.available} completed
          </span>
        )}
      </div>
      <div
        className="meter"
        role="progressbar"
        aria-label="Visualizations completed"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stats.percent}
      >
        <span style={{ width: `${stats.percent}%` }} />
      </div>
    </div>
  );
}
