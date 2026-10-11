import { useEffect, useMemo, useRef, useState } from 'react';
import { Eraser, Footprints, Plus, Search, Trash2 } from 'lucide-react';
import VisualizationControls from '../components/VisualizationControls.jsx';
import ListView, { ListLegend } from '../components/ListView.jsx';
import ExplanationPanel from '../components/ExplanationPanel.jsx';
import CodePanel from '../components/CodePanel.jsx';
import { JAVA, MAX_NODES, OPS, clearList, deleteValue, insertAt, insertHead, insertTail, searchValue, traverseList } from '../algorithms/linkedList/operations.js';
import { useVisualization } from '../hooks/useVisualization.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { SPEEDS } from '../hooks/usePlayback.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { parseInteger } from '../utils/validation.js';

const TOPIC = 'll-singly';
const INITIAL = [{ id: 1, value: 12 }, { id: 2, value: 7 }, { id: 3, value: 30 }];

const restStep = (nodes) => ({
  nodes, floating: null, current: null, prev: null, found: null, removing: null, bypass: null, output: null,
  type: 'rest', title: 'Current list', lines: [], line: 0, op: null,
  text: nodes.length ? `The list has ${nodes.length} node${nodes.length === 1 ? '' : 's'}. Choose an operation to watch how its pointers change.` : 'The list is empty: HEAD points to NULL. Insert a node to begin.',
});

export default function LinkedListVisualizer() {
  const { state, markVisited, markCompleted, setPref } = useProgress();
  const speed = state.prefs.speed;
  const [nodes, setNodes] = useState(INITIAL);
  const [session, setSession] = useState(null);
  const [valueText, setValueText] = useState('');
  const [posText, setPosText] = useState('');
  const [error, setError] = useState('');
  const nextId = useRef(100);
  const used = useRef(new Set());

  const steps = useMemo(() => {
    const base = session ? session.steps : [restStep(nodes)];
    return base.map((s) => ({ ...s, vars: { size: s.nodes.length, head: s.nodes[0]?.value ?? 'null' } }));
  }, [session, nodes]);
  const viz = useVisualization(steps, SPEEDS[speed - 1].ms);
  const { current } = viz;
  const locked = viz.playing;

  useEffect(() => { markVisited(TOPIC); }, [markVisited]);
  // Start playing as soon as a new operation has been recorded.
  useEffect(() => { if (session) viz.play(); }, [session]); // eslint-disable-line react-hooks/exhaustive-deps
  useKeyboardShortcuts({ Space: viz.toggle, ArrowRight: viz.next, ArrowLeft: viz.prev, r: viz.reset });

  const apply = (key, res) => {
    if (!res.ok) { setError(res.error); return; }
    setError('');
    setNodes(res.nodes);
    setSession({ steps: res.steps });
    used.current.add(key);
    if (used.current.has('insert') && used.current.has('delete')) markCompleted(TOPIC);
  };
  const needValue = () => {
    const p = parseInteger(valueText, 'value');
    if (!p.ok) setError(p.error);
    return p.ok ? p.value : null;
  };

  const doInsert = (kind) => {
    const v = needValue();
    if (v === null) return;
    const id = nextId.current++;
    if (kind === 'head') return apply('insert', insertHead(nodes, v, id));
    if (kind === 'tail') return apply('insert', insertTail(nodes, v, id));
    const p = parseInteger(posText, 'position', 0, MAX_NODES);
    if (!p.ok) { setError(p.error); return undefined; }
    return apply('insert', insertAt(nodes, p.value, v, id));
  };
  const doDelete = () => { const v = needValue(); if (v !== null) apply('delete', deleteValue(nodes, v)); };
  const doSearch = () => { const v = needValue(); if (v !== null) apply('search', searchValue(nodes, v)); };

  const op = current.op ? OPS[current.op] : null;

  return (
    <div className="page viz-page">
      <header className="viz-header">
        <div className="page__head">
          <h1>Singly Linked List</h1>
          <p>A chain of nodes where each node stores a value and a pointer to the next one. Every operation below is recorded step by step, so you can play it, pause it and move through it in both directions.</p>
        </div>
        <ul className="chips" aria-label="Summary">
          <li className="chip">Difficulty <strong>Beginner</strong></li>
          <li className="chip">Size <strong>{nodes.length} / {MAX_NODES}</strong></li>
        </ul>
      </header>

      <section className="card controls" aria-label="Operations">
        <div className="ll-controls">
          <label className="field">
            <span className="field__label">Value (-999 to 999)</span>
            <input className="input mono" value={valueText} onChange={(e) => setValueText(e.target.value)} disabled={locked} placeholder="e.g. 42" inputMode="numeric" autoComplete="off" />
          </label>
          <label className="field">
            <span className="field__label">Position (0 to size)</span>
            <input className="input mono" value={posText} onChange={(e) => setPosText(e.target.value)} disabled={locked} placeholder="e.g. 2" inputMode="numeric" autoComplete="off" />
          </label>
        </div>
        <div className="ll-buttons" role="group" aria-label="List operations">
          <button type="button" className="btn btn--primary" disabled={locked} onClick={() => doInsert('head')}><Plus /> Insert at beginning</button>
          <button type="button" className="btn btn--primary" disabled={locked} onClick={() => doInsert('tail')}><Plus /> Insert at end</button>
          <button type="button" className="btn btn--primary" disabled={locked} onClick={() => doInsert('pos')} title="Uses the position field"><Plus /> Insert at position</button>
          <button type="button" className="btn" disabled={locked} onClick={doDelete}><Trash2 /> Delete by value</button>
          <button type="button" className="btn" disabled={locked} onClick={doSearch}><Search /> Search</button>
          <button type="button" className="btn" disabled={locked} onClick={() => apply('search', traverseList(nodes))}><Footprints /> Traverse</button>
          <button type="button" className="btn btn--danger" disabled={locked} onClick={() => apply('clear', clearList(nodes))}><Eraser /> Clear list</button>
        </div>
        {error && <p role="alert" className="field-error">{error}</p>}
        {locked && <p className="field-hint">Operations are locked while the animation plays. Pause or let it finish.</p>}
        <VisualizationControls playback={viz} speed={speed} onSpeed={(s) => setPref('speed', s)} totalSteps={viz.totalSteps} disabled={!session} />
      </section>

      <div className="viz-grid">
        <div className="viz-main">
          <section className="card" aria-label="Visualization">
            <ListView step={current} />
            <ListLegend />
          </section>
          {current.output && (
            <section className="card" aria-labelledby="ll-out">
              <h2 id="ll-out" className="card__title">Traversal output</h2>
              <p className="mono">{current.output.length ? current.output.join(' → ') : '(nothing visited yet)'}</p>
            </section>
          )}
          <ExplanationPanel step={current} playing={viz.playing} />
          {op && (
            <section className="card" aria-labelledby="ll-cx">
              <h2 id="ll-cx" className="card__title">{op.label}: time complexity</h2>
              <p><code>{op.complexity}</code> <span className="muted">{op.why}</span></p>
            </section>
          )}
        </div>
        <div className="viz-side">
          <CodePanel java={JAVA} step={current} />
        </div>
      </div>
    </div>
  );
}
