import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrayControls from '../components/ArrayControls.jsx';
import VisualizationControls from '../components/VisualizationControls.jsx';
import BarChart, { ChartLegend } from '../components/BarChart.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import ExplanationPanel from '../components/ExplanationPanel.jsx';
import ComplexityPanel from '../components/ComplexityPanel.jsx';
import CodePanel from '../components/CodePanel.jsx';
import NotFound from './NotFound.jsx';
import { SORTING_ALGORITHMS } from '../algorithms/sorting/index.js';
import { COMPLEXITY } from '../utils/complexity.js';
import { useVisualization } from '../hooks/useVisualization.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { SPEEDS } from '../hooks/usePlayback.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { DEFAULT_SIZE, MIN_SIZE, generateArray } from '../utils/arrays.js';
import { parseArrayInput } from '../utils/validation.js';
import { topicsIn } from '../data/catalog.js';

export default function SortingVisualizer() {
  const { algo } = useParams();
  const entry = SORTING_ALGORITHMS[algo];
  if (!entry) return <NotFound message="That sorting algorithm is not available yet." backTo="/sorting/bubble" backLabel="Open Bubble Sort" />;
  return <SortingWorkspace key={entry.slug} entry={entry} />;
}

function SortingWorkspace({ entry }) {
  const navigate = useNavigate();
  const { state, markVisited, markCompleted, setPref } = useProgress();
  const speed = state.prefs.speed;
  const complexity = COMPLEXITY[entry.topicId];

  const [array, setArray] = useState(() => generateArray(DEFAULT_SIZE, 'random'));
  const [pattern, setPattern] = useState('random');
  const [draft, setDraft] = useState(() => array.join(', '));
  const [inputError, setInputError] = useState('');

  // Steps are derived from the array. Playback state is only { index, playing }.
  const steps = useMemo(() => entry.generateSteps(array), [entry, array]);
  const viz = useVisualization(steps, SPEEDS[speed - 1].ms);
  const { current } = viz;
  const locked = viz.playing;
  const finalStep = steps[steps.length - 1];
  const runSummary = `For this array of ${array.length}: ${entry.counters.map((c) => `${finalStep[c]} ${c}`).join(' and ')} in total.`;

  useEffect(() => { markVisited(entry.topicId); }, [entry.topicId, markVisited]);
  const finished = current.type === 'done' && array.length > 1;
  useEffect(() => { if (finished) markCompleted(entry.topicId); }, [finished, entry.topicId, markCompleted]);

  const generate = useCallback((size = array.length, pat = pattern) => {
    const next = generateArray(size, pat);
    setArray(next);
    setDraft(next.join(', '));
    setInputError('');
  }, [array.length, pattern]);

  const applyDraft = () => {
    const result = parseArrayInput(draft);
    if (!result.ok) { setInputError(result.error); return; }
    setArray(result.values);
    setDraft(result.values.join(', '));
    setInputError('');
  };

  useKeyboardShortcuts({
    Space: viz.toggle,
    ArrowRight: viz.next,
    ArrowLeft: viz.prev,
    r: viz.reset,
    g: () => { if (!locked) generate(); },
  });

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
          options={topicsIn('sorting')}
          currentSlug={entry.slug}
          onAlgorithm={(slug) => navigate(`/sorting/${slug}`)}
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
        <VisualizationControls
          playback={viz}
          speed={speed}
          onSpeed={(s) => setPref('speed', s)}
          totalSteps={viz.totalSteps}
        />
      </section>

      <div className="viz-grid">
        <div className="viz-main">
          <section className="card" aria-label="Visualization">
            <BarChart values={current.array} step={current} />
            <ChartLegend extras={entry.legend} />
            {Math.min(...array) < 0 && (
              <p className="field-hint">Bars are scaled from the smallest value so negative numbers stay visible.</p>
            )}
          </section>
          <StatsPanel current={current} stepIndex={viz.index} totalSteps={viz.totalSteps} size={array.length} counters={entry.counters} defs={entry.counterDefs} />
          <ExplanationPanel step={current} playing={viz.playing} />
        </div>
        <div className="viz-side">
          <CodePanel java={entry.java} step={current} />
          <ComplexityPanel complexity={complexity} runSummary={runSummary} />
        </div>
      </div>
    </div>
  );
}
