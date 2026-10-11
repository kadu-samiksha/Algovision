import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eraser, Eye, Hash, Minus, Plus } from 'lucide-react';
import CodePanel from '../components/CodePanel.jsx';
import NotFound from './NotFound.jsx';
import { CAPACITY, QUEUE_JAVA, STACK_JAVA, queueNew, queueOps, queueVars, stackNew, stackOps, stackVars } from '../algorithms/stackQueue/structures.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { parseInteger } from '../utils/validation.js';

const KINDS = {
  stack: {
    topicId: 'sq-stack', title: 'Stack', rule: 'Last in, first out (LIFO)', difficulty: 'Beginner',
    summary: 'A stack adds and removes values at one end, the top. The value pushed most recently is always the first one popped.',
    ops: stackOps, make: stackNew, vars: stackVars, java: STACK_JAVA,
    add: { op: 'push', label: 'Push' }, remove: { op: 'pop', label: 'Pop' }, next: 'top',
  },
  queue: {
    topicId: 'sq-queue', title: 'Queue', rule: 'First in, first out (FIFO)', difficulty: 'Beginner',
    summary: 'A queue adds values at the rear and removes them from the front. The value that has waited longest is always served first.',
    ops: queueOps, make: queueNew, vars: queueVars, java: QUEUE_JAVA,
    add: { op: 'enqueue', label: 'Enqueue' }, remove: { op: 'dequeue', label: 'Dequeue' }, next: 'front',
  },
};

export default function StackQueueVisualizer() {
  const { kind } = useParams();
  if (!KINDS[kind]) return <NotFound message="Choose Stack or Queue." backTo="/stacks-queues/stack" backLabel="Open Stack" />;
  return <Workspace key={kind} kind={kind} cfg={KINDS[kind]} />;
}

function Workspace({ kind, cfg }) {
  const { markVisited, markCompleted } = useProgress();
  const [ds, setDs] = useState(cfg.make);
  const [uids, setUids] = useState([]);
  const [text, setText] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const [leaving, setLeaving] = useState(null);
  const [peeked, setPeeked] = useState(false);
  const used = useRef({ added: false, removed: false });
  const nextUid = useRef(1);
  const opNo = useRef(0);

  useEffect(() => { markVisited(cfg.topicId); }, [cfg.topicId, markVisited]);
  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => setLeaving(null), 320);
    return () => clearTimeout(id);
  }, [leaving]);

  const run = (opName, value) => {
    const r = cfg.ops[opName](ds, value);
    opNo.current += 1;
    setResult(r);
    setPeeked(false);
    setLog((l) => [{ n: opNo.current, ok: r.ok, text: r.message, label: value !== undefined && (opName === cfg.add.op) ? `${opName}(${value})` : `${opName}()` }, ...l].slice(0, 8));
    if (!r.ok) return;
    setDs(r.state);
    if (opName === cfg.add.op) {
      setUids((u) => [...u, nextUid.current++]);
      used.current.added = true;
    } else if (opName === cfg.remove.op) {
      const removedUid = kind === 'stack' ? uids[uids.length - 1] : uids[0];
      setLeaving({ uid: removedUid, value: r.value });
      setUids((u) => (kind === 'stack' ? u.slice(0, -1) : u.slice(1)));
      used.current.removed = true;
    } else if (opName === 'clear') {
      setUids([]);
    } else if (opName === 'peek') {
      setPeeked(true);
    }
    if (used.current.added && used.current.removed) markCompleted(cfg.topicId);
  };

  const onAdd = (e) => {
    e.preventDefault();
    const p = parseInteger(text, 'value');
    if (!p.ok) { setFieldError(p.error); return; }
    setFieldError('');
    run(cfg.add.op, p.value);
    setText('');
  };

  const n = ds.items.length;
  const codeStep = result
    ? { lines: result.lines, line: result.lines[0], vars: cfg.vars(ds) }
    : { lines: [], line: 0, vars: cfg.vars(ds) };
  const nextOut = n ? (kind === 'stack' ? ds.items[n - 1] : ds.items[0]) : null;

  const items = ds.items.map((value, i) => ({ value, uid: uids[i] ?? `i${i}`, i }));
  const isTop = (i) => (kind === 'stack' ? i === n - 1 : i === 0);

  return (
    <div className="page viz-page">
      <header className="viz-header">
        <div className="page__head">
          <h1>Stacks and Queues</h1>
          <p>{cfg.summary}</p>
        </div>
        <ul className="chips" aria-label="Summary">
          <li className="chip">Rule <strong>{cfg.rule}</strong></li>
          <li className="chip">Operations <strong>O(1)</strong></li>
          <li className="chip">Capacity <strong>{CAPACITY}</strong></li>
        </ul>
      </header>

      <nav className="tabs" aria-label="Structure">
        <Link to="/stacks-queues/stack" className="tab" aria-current={kind === 'stack' ? 'page' : undefined}>Stack</Link>
        <Link to="/stacks-queues/queue" className="tab" aria-current={kind === 'queue' ? 'page' : undefined}>Queue</Link>
      </nav>

      <section className="card controls" aria-label="Operations">
        <form className="sq-controls" onSubmit={onAdd} noValidate>
          <label className="field">
            <span className="field__label">Value (whole number, -999 to 999)</span>
            <input className="input mono" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 42" inputMode="numeric" autoComplete="off"
              aria-invalid={fieldError ? 'true' : undefined} aria-describedby={fieldError ? 'sq-error' : undefined} />
          </label>
          <button type="submit" className="btn btn--primary"><Plus /> {cfg.add.label}</button>
          <button type="button" className="btn" onClick={() => run(cfg.remove.op)}><Minus /> {cfg.remove.label}</button>
          <button type="button" className="btn" onClick={() => run('peek')}><Eye /> Peek</button>
          <button type="button" className="btn" onClick={() => run('size')}><Hash /> Size</button>
          <button type="button" className="btn btn--danger" onClick={() => run('clear')}><Eraser /> Clear</button>
        </form>
        {fieldError && <p id="sq-error" role="alert" className="field-error">{fieldError}</p>}
      </section>

      <div className="viz-grid">
        <div className="viz-main">
          <section className="card" aria-label={`${cfg.title} visualization`}>
            <div className="sq-meta">
              <span className="chip">Size <strong>{n} / {CAPACITY}</strong></span>
              <span className="chip">Next to leave <strong>{nextOut === null ? 'nothing (empty)' : nextOut}</strong></span>
            </div>
            {kind === 'stack' ? (
              <div className="stack" role="list" aria-label={`Stack, bottom to top: ${ds.items.join(', ') || 'empty'}`}>
                {leaving && <div className="sq-item sq-item--leaving" aria-hidden="true">{leaving.value}</div>}
                {items.slice().reverse().map(({ value, uid, i }) => (
                  <div role="listitem" key={uid} className={`sq-item${i === n - 1 && opNo.current && result?.op === 'push' && result.ok ? ' is-new' : ''}${peeked && i === n - 1 ? ' is-peek' : ''}`}>
                    <span>{value}</span>
                    {i === n - 1 && <span className="sq-label">TOP</span>}
                    {i === 0 && n > 1 && <span className="sq-label sq-label--bottom">bottom</span>}
                  </div>
                ))}
                {!n && <div className="sq-empty">The stack is empty</div>}
                <div className="stack__base" aria-hidden="true" />
              </div>
            ) : (
              <div className="queue-wrap">
                <div className="queue" role="list" aria-label={`Queue, front to rear: ${ds.items.join(', ') || 'empty'}`}>
                  {leaving && <div className="sq-item sq-item--leaving" aria-hidden="true">{leaving.value}</div>}
                  {items.map(({ value, uid, i }) => (
                    <div role="listitem" key={uid} className={`sq-item${i === n - 1 && result?.op === 'enqueue' && result.ok ? ' is-new' : ''}${peeked && i === 0 ? ' is-peek' : ''}`}>
                      <span>{value}</span>
                      {i === 0 && <span className="sq-label">FRONT</span>}
                      {i === n - 1 && <span className="sq-label sq-label--rear">REAR</span>}
                    </div>
                  ))}
                  {!n && <div className="sq-empty">The queue is empty</div>}
                </div>
                <p className="queue-flow" aria-hidden="true">Dequeue from the front (left). Enqueue at the rear (right).</p>
              </div>
            )}
          </section>

          <section className="card" aria-labelledby="sq-result-title">
            <h2 id="sq-result-title" className="card__title">Result of the last operation</h2>
            {result ? (
              <p className={`result ${result.ok ? 'result--found' : 'result--not-found'}`} role={result.ok ? 'status' : 'alert'}>
                {result.ok ? 'Done. ' : 'Not allowed. '}{result.message}
              </p>
            ) : (
              <p className="muted">Nothing has happened yet. {cfg.add.label} a value to begin.</p>
            )}
            {log.length > 1 && (
              <details>
                <summary>Recent operations</summary>
                <ol className="oplog">
                  {log.map((l) => <li key={l.n} className={l.ok ? '' : 'is-error'}><code>{l.label}</code> {l.ok ? '' : '(rejected) '}{l.text}</li>)}
                </ol>
              </details>
            )}
          </section>
        </div>
        <div className="viz-side">
          <CodePanel java={cfg.java} step={codeStep} />
        </div>
      </div>
    </div>
  );
}
