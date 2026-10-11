import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { CATEGORIES, topicsIn } from '../data/catalog.js';
import { useProgress } from '../context/ProgressContext.jsx';

export default function Progress() {
  const { state, stats, resetProgress } = useProgress();
  const [confirming, setConfirming] = useState(false);

  const statusOf = (t) =>
    !t.available ? 'Not built yet' : state.completed[t.id] ? 'Completed' : state.visited[t.id] ? 'Visited, not finished' : 'Not started';

  return (
    <div className="page">
      <div className="page__head">
        <h1>My Progress</h1>
        <p>Saved in this browser only. It is not synced across devices and clears if you clear site data.</p>
      </div>

      <section className="card" aria-label="Summary">
        <dl className="home-stats">
          <div><dt>Topics visited</dt><dd>{stats.visited}<small> of {stats.available}</small></dd></div>
          <div><dt>Visualizations completed</dt><dd>{stats.completed}<small> of {stats.available}</small></dd></div>
          <div><dt>Practice attempted</dt><dd>{stats.answered}</dd></div>
          <div><dt>Practice correct</dt><dd>{stats.correct}<small>{stats.answered ? ` of ${stats.answered}` : ''}</small></dd></div>
          <div><dt>Overall progress</dt><dd>{stats.percent}<small>%</small></dd></div>
        </dl>
        <p className="field-hint">A visualization counts as completed when you play, step or jump to its final state. Stacks and queues need at least one add and one remove, and the linked list needs one insert and one delete.</p>
      </section>

      {CATEGORIES.map((c) => (
        <section className="card" key={c.id} aria-labelledby={`p-${c.id}`}>
          <h2 id={`p-${c.id}`} className="card__title">{c.title}</h2>
          <table className="data">
            <thead><tr><th scope="col">Topic</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {topicsIn(c.id).map((t) => (
                <tr key={t.id}><td>{t.title}</td><td className={t.available ? '' : 'muted'}>{statusOf(t)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <div>
        <button type="button" className="btn btn--danger" onClick={() => setConfirming(true)}><Trash2 /> Reset progress</button>
      </div>

      <Modal open={confirming} onClose={() => setConfirming(false)} title="Reset all progress?">
        <p className="muted">This clears visited topics, completed visualizations, practice results and your last-opened topic from this browser. Your settings are kept. This cannot be undone.</p>
        <div className="modal__actions">
          <button type="button" className="btn" onClick={() => setConfirming(false)}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={() => { resetProgress(); setConfirming(false); }}>Reset progress</button>
        </div>
      </Modal>
    </div>
  );
}
