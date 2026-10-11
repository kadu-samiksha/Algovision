import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Sprout } from 'lucide-react';
import VisualizationControls from '../components/VisualizationControls.jsx';
import TreeSvg, { TreeLegend } from '../components/TreeSvg.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import ExplanationPanel from '../components/ExplanationPanel.jsx';
import ComplexityPanel from '../components/ComplexityPanel.jsx';
import CodePanel from '../components/CodePanel.jsx';
import NotFound from './NotFound.jsx';
import { EXAMPLE_TREE, TRAVERSALS, parseLevelOrder, traversalSteps } from '../algorithms/trees/tree.js';
import { COMPLEXITY } from '../utils/complexity.js';
import { useVisualization } from '../hooks/useVisualization.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { SPEEDS } from '../hooks/usePlayback.js';
import { useProgress } from '../context/ProgressContext.jsx';

export default function TreeVisualizer() {
  const { order } = useParams();
  const entry = TRAVERSALS[order];
  if (!entry) return <NotFound message="Choose preorder, inorder, postorder or level-order." backTo="/trees/preorder" backLabel="Open Preorder Traversal" />;
  return <TreeWorkspace entry={entry} />;
}

function TreeWorkspace({ entry }) {
  const { state, markVisited, markCompleted, setPref } = useProgress();
  const speed = state.prefs.speed;
  const complexity = COMPLEXITY[entry.topicId];
  const [draft, setDraft] = useState(EXAMPLE_TREE);
  const [applied, setApplied] = useState(() => parseLevelOrder(EXAMPLE_TREE));
  const [error, setError] = useState('');

  const steps = useMemo(() => traversalSteps(applied.nodes, applied.root, entry.slug), [applied, entry.slug]);
  const viz = useVisualization(steps, SPEEDS[speed - 1].ms);
  const { current } = viz;
  const locked = viz.playing;
  const final = steps[steps.length - 1];
  const idsToValues = (ids) => ids.map((id) => applied.nodes[id].value);

  useEffect(() => { markVisited(entry.topicId); }, [entry.topicId, markVisited]);
  const finished = current.type === 'done' && applied.nodes.length > 0;
  useEffect(() => { if (finished) markCompleted(entry.topicId); }, [finished, entry.topicId, markCompleted]);
  useKeyboardShortcuts({ Space: viz.toggle, ArrowRight: viz.next, ArrowLeft: viz.prev, r: viz.reset });

  const applyTree = (text) => {
    const r = parseLevelOrder(text);
    if (!r.ok) { setError(r.error); return; }
    setError('');
    setApplied(r);
    setDraft(text);
  };

  return (
    <div className="page viz-page">
      <header className="viz-header">
        <div className="page__head">
          <h1>{entry.name}</h1>
          <p>{entry.rule}. {entry.order === 'level' ? 'It uses a queue, so every level is finished before the next one starts.' : 'It is recursive: the call stack remembers where to continue after each subtree.'}</p>
        </div>
        <ul className="chips" aria-label="Summary">
          <li className="chip">Difficulty <strong>{entry.difficulty}</strong></li>
          <li className="chip">Time <strong>{complexity.time.average}</strong></li>
          <li className="chip">Space <strong>{complexity.space}</strong></li>
        </ul>
      </header>

      <nav className="tabs" aria-label="Traversal">
        {Object.values(TRAVERSALS).map((t) => (
          <Link key={t.slug} to={`/trees/${t.slug}`} className="tab" aria-current={t.slug === entry.slug ? 'page' : undefined}>{t.short}</Link>
        ))}
      </nav>

      <section className="card controls" aria-label="Tree input">
        <form className="tree-form" onSubmit={(e) => { e.preventDefault(); applyTree(draft); }} noValidate>
          <label className="field">
            <span className="field__label">Tree in level-order (up to 31 nodes)</span>
            <input className="input mono" value={draft} disabled={locked} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. 1 2 3 4 5 null 6"
              aria-invalid={error ? 'true' : undefined} aria-describedby="tree-help" autoComplete="off" spellCheck="false" />
          </label>
          <button type="submit" className="btn" disabled={locked}><Check /> Build tree</button>
          <button type="button" className="btn" disabled={locked} onClick={() => applyTree(EXAMPLE_TREE)}><Sprout /> Load example</button>
        </form>
        <p id="tree-help" className="field-hint">
          List values row by row, left to right, writing <code>null</code> for a missing child. A null node has no child slots, so its children are not listed. Example: <code>1 2 3 null 4</code> is root 1 with children 2 and 3, where 2 has only a right child, 4. Leave the field empty for an empty tree.
        </p>
        {error && <p role="alert" className="field-error">{error}</p>}
        <VisualizationControls playback={viz} speed={speed} onSpeed={(s) => setPref('speed', s)} totalSteps={viz.totalSteps} />
      </section>

      <div className="viz-grid">
        <div className="viz-main">
          <section className="card" aria-label="Tree">
            <TreeSvg nodes={applied.nodes} root={applied.root} step={current} />
            <TreeLegend />
          </section>
          <section className="card tree-panels" aria-label="Traversal state">
            <div>
              <h2 className="card__title">Traversal output</h2>
              <ol className="out-list" aria-label="Output so far">
                {current.output.length ? current.output.map((v, i) => <li key={i}>{v}</li>) : <li className="out-list__empty">nothing visited yet</li>}
              </ol>
            </div>
            <div>
              <h2 className="card__title">{current.structure}{current.structure === 'Queue' ? ' (front on the left)' : ' (newest call on the right)'}</h2>
              <ol className="out-list out-list--stack" aria-label={current.structure}>
                {current.stack.length ? idsToValues(current.stack).map((v, i) => <li key={i}>{v}</li>) : <li className="out-list__empty">empty</li>}
              </ol>
            </div>
          </section>
          <StatsPanel current={current} stepIndex={viz.index} totalSteps={viz.totalSteps} size={applied.nodes.length} sizeLabel="Tree nodes" counters={[]}
            extra={[['Nodes visited', current.visited.length]]}
            defs={[['Nodes visited', 'how many nodes have been added to the output so far.']]} />
          <ExplanationPanel step={current} playing={viz.playing} />
        </div>
        <div className="viz-side">
          <CodePanel java={entry.java} step={current} />
          <ComplexityPanel complexity={complexity} runSummary={`For this tree of ${applied.nodes.length} node${applied.nodes.length === 1 ? '' : 's'}: output ${final.output.length ? final.output.join(', ') : '(empty)'}.`} />
        </div>
      </div>
    </div>
  );
}
