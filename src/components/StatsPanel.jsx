const LABELS = { comparisons: 'Comparisons', swaps: 'Swaps', writes: 'Writes' };

/** `counters` lists which step fields to show (e.g. ['comparisons', 'swaps']); `defs` explains each counter. */
export default function StatsPanel({ current, stepIndex, totalSteps, size, sizeLabel = 'Array size', counters, defs, extra = [] }) {
  const items = [
    ...counters.map((c) => [LABELS[c], current[c]]),
    ...extra,
    ['Current step', stepIndex],
    ['Total steps', totalSteps],
    [sizeLabel, size],
  ];
  return (
    <section className="card" aria-labelledby="stats-title">
      <h2 id="stats-title" className="card__title">Live statistics</h2>
      <dl className="stats">
        {items.map(([label, value]) => (
          <div className="stat" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <details>
        <summary>How are these counted?</summary>
        <ul className="defs">
          {defs.map(([term, text]) => <li key={term}><strong>{term}:</strong> {text}</li>)}
          <li><strong>Steps:</strong> every recorded state. Step 0 is the starting state; total steps is the number of states after it.</li>
        </ul>
      </details>
    </section>
  );
}
