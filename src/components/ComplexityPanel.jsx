export default function ComplexityPanel({ complexity, runSummary }) {
  const rows = [
    ['Best case time', complexity.time.best],
    ['Average case time', complexity.time.average],
    ['Worst case time', complexity.time.worst],
    ['Auxiliary space', complexity.space],
  ];
  return (
    <section className="card" aria-labelledby="complexity-title">
      <h2 id="complexity-title" className="card__title">Complexity</h2>
      <table className="data">
        <tbody>
          {rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td className="mono">{value}</td></tr>)}
        </tbody>
      </table>
      {runSummary && <p className="muted complexity__run">{runSummary}</p>}
      <details>
        <summary>Why these complexities?</summary>
        <ul className="defs">
          {complexity.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </details>
    </section>
  );
}
