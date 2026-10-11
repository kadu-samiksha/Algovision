import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDownUp, Crosshair, Search as SearchIcon } from 'lucide-react';
import ArrayControls from '../components/ArrayControls.jsx';
import VisualizationControls from '../components/VisualizationControls.jsx';
import SearchCells, { SearchLegend } from '../components/SearchCells.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import ExplanationPanel from '../components/ExplanationPanel.jsx';
import ComplexityPanel from '../components/ComplexityPanel.jsx';
import CodePanel from '../components/CodePanel.jsx';
import NotFound from './NotFound.jsx';
import { SEARCH_ALGORITHMS } from '../algorithms/searching/search.js';
import { COMPLEXITY } from '../utils/complexity.js';
import { useVisualization } from '../hooks/useVisualization.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { SPEEDS } from '../hooks/usePlayback.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { DEFAULT_SIZE, MIN_SIZE, generateArray } from '../utils/arrays.js';
import { parseArrayInput, parseInteger } from '../utils/validation.js';
import { topicsIn } from '../data/catalog.js';

export default function SearchingVisualizer() {
  const { algo } = useParams();
  const entry = SEARCH_ALGORITHMS[algo];
  if (!entry) return <NotFound message="That searching algorithm does not exist." backTo="/searching/linear" backLabel="Open Linear Search" />;
  return <SearchWorkspace key={entry.slug} entry={entry} />;
}

const idleStep = (array, text) => ({
  array, current: null, left: null, right: null, mid: null, found: null, result: null,
  eliminated: array.map(() => false), comparisons: 0, type: 'idle', title: 'Cannot start yet', lines: [1], line: 1, vars: {}, text,
});

function SearchWorkspace({ entry }) {
  const navigate = useNavigate();
  const { state, markVisited, markCompleted, setPref } = useProgress();
  const speed = state.prefs.speed;
  const complexity = COMPLEXITY[entry.topicId];
  const initialPattern = entry.needsSorted ? 'sorted' : 'random';

  const [array, setArray] = useState(() => generateArray(DEFAULT_SIZE, initialPattern));
  const [pattern, setPattern] = useState(initialPattern);
  const [draft, setDraft] = useState(() => array.join(', '));
  const [inputError, setInputError] = useState('');
  const [targetText, setTargetText] = useState(() => String(array[Math.floor(array.length / 2)]));

  const target = useMemo(() => parseInteger(targetText, 'target value'), [targetText]);
  const arrayProblem = entry.validate(array);
  const blocked = !target.ok ? target.error : arrayProblem;
  const targetValue = target.ok ? target.value : null;

  const steps = useMemo(
    () => (blocked ? [idleStep(array, blocked)] : entry.generateSteps(array, targetValue)),
    [entry, array, blocked, targetValue],
  );
  const viz = useVisualization(steps, SPEEDS[speed - 1].ms);
  const { current } = viz;
  const locked = viz.playing;
  const final = steps[steps.length - 1];

  useEffect(() => { markVisited(entry.topicId); }, [entry.topicId, markVisited]);
  const finished = current.result !== null;
  useEffect(() => { if (finished) markCompleted(entry.topicId); }, [finished, entry.topicId, markCompleted]);

  const replaceArray = (next) => { setArray(next); setDraft(next.join(', ')); setInputError(''); };
  const generate = useCallback((size = array.length, pat = pattern) => replaceArray(generateArray(size, pat)), [array.length, pattern]);
  const applyDraft = () => {
    const r = parseArrayInput(draft);
    if (!r.ok) { setInputError(r.error); return; }
    replaceArray(r.values);
  };
  const pickFromArray = () => setTargetText(String(array[Math.floor(Math.random() * array.length)]));
  const pickMissing = () => {
    const max = Math.max(...array);
    setTargetText(String(max < 999 ? max + 1 : Math.min(...array) - 1));
  };

  useKeyboardShortcuts({ Space: viz.toggle, ArrowRight: viz.next, ArrowLeft: viz.prev, r: viz.reset, g: () => { if (!locked) generate(); } });

  return (
    <div className="page viz-page">
      <header className="viz-header">
        <div className="page__head">
          <h1>{entry.name}</h1>
          <p>{entry.summary}</p>
        </div>
        <ul className="chips" aria-label="Algorithm summary">
          <li className="chip">Difficulty <strong>{entry.difficulty}</strong></li>
          <li className="chip">Time <strong>{complexity.time.average} average</strong></li>
          <li className="chip">Worst <strong>{complexity.time.worst}</strong></li>
          <li className="chip">Space <strong>{complexity.space}</strong></li>
        </ul>
      </header>

      <section className="card controls" aria-label="Controls">
        <ArrayControls
          options={topicsIn('searching')}
          currentSlug={entry.slug}
          onAlgorithm={(slug) => navigate(`/searching/${slug}`)}
          size={Math.max(MIN_SIZE, array.length)}
          onSize={(n) => generate(n, pattern)}
          pattern={pattern}
          onPattern={(p) => { setPattern(p); generate(array.length, p); }}
          onGenerate={() => generate()}
          draft={draft}
          onDraft={setDraft}
          onApply={applyDraft}
          error={inputError}
          locked={locked}
        />
        <div className="target-row">
          <label className="field">
            <span className="field__label">Target value</span>
            <input className="input mono" value={targetText} disabled={locked} onChange={(e) => setTargetText(e.target.value)}
              aria-invalid={!target.ok ? 'true' : undefined} aria-describedby={blocked ? 'search-problem' : undefined}
              inputMode="numeric" autoComplete="off" spellCheck="false" />
          </label>
          <button type="button" className="btn" onClick={pickFromArray} disabled={locked} title="Use a value that is in the array"><Crosshair /> Pick a value from the array</button>
          <button type="button" className="btn" onClick={pickMissing} disabled={locked} title="Use a value that is not in the array to see an unsuccessful search"><SearchIcon /> Pick a missing value</button>
        </div>
        {blocked && (
          <div id="search-problem" role="alert" className="notice">
            <p>{blocked}</p>
            {arrayProblem && target.ok && entry.needsSorted && (
              <button type="button" className="btn" onClick={() => replaceArray([...array].sort((a, b) => a - b))}><ArrowDownUp /> Sort the array ascending</button>
            )}
          </div>
        )}
        <VisualizationControls playback={viz} speed={speed} onSpeed={(s) => setPref('speed', s)} totalSteps={viz.totalSteps} disabled={Boolean(blocked)} />
      </section>

      <div className="viz-grid">
        <div className="viz-main">
          <section className="card" aria-label="Visualization">
            {current.result && (
              <p className={`result result--${current.result}`} role="status">
                {current.result === 'found' ? `Found ${targetValue} at index ${current.found}.` : `${targetValue} is not in the array. Unsuccessful search.`}
              </p>
            )}
            <SearchCells array={array} step={current} binary={entry.needsSorted} />
            <SearchLegend binary={entry.needsSorted} />
          </section>
          <StatsPanel current={current} stepIndex={viz.index} totalSteps={viz.totalSteps} size={array.length} counters={['comparisons']} defs={entry.counterDefs} />
          <ExplanationPanel step={current} playing={viz.playing} />
        </div>
        <div className="viz-side">
          <CodePanel java={entry.java} step={blocked ? null : current} />
          <ComplexityPanel complexity={complexity} runSummary={blocked ? null : `For this search: ${final.comparisons} comparison${final.comparisons === 1 ? '' : 's'} (${final.result === 'found' ? 'found' : 'not found'}).`} />
        </div>
      </div>
    </div>
  );
}
