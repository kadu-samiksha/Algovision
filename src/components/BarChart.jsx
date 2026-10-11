import { Check, ArrowLeftRight } from 'lucide-react';
import { barHeightPercent } from '../utils/arrays.js';

const MAX_LABELLED = 20; // above this many bars, value labels and index tags are hidden
const MARK_TAG = { pivot: 'P', key: 'K', min: 'min', root: 'R', hole: '[ ]', write: 'W' };
const MARK_NAME = { pivot: 'Pivot or candidate', key: 'Key being inserted', min: 'Current minimum', root: 'Heap root being sifted', write: 'Value just written' };

function stateOf(step, i) {
  if (step?.swapped?.includes(i)) return 'swap';
  if (step?.compare?.includes(i)) return 'compare';
  const mark = step?.marks?.[i];
  if (mark === 'write') return 'write';
  if (mark) return 'mark';
  if (step?.sorted?.[i]) return 'sorted';
  return 'default';
}

export function ChartLegend({ extras = [] }) {
  return (
    <ul className="legend" aria-label="Legend">
      <li><span className="legend__swatch" data-state="default" /> Waiting</li>
      <li><span className="legend__swatch" data-state="compare" /> Comparing (vs)</li>
      <li><span className="legend__swatch" data-state="swap" /> Swapping</li>
      <li><span className="legend__swatch" data-state="sorted" /> In final position</li>
      {extras.map((m) => (
        <li key={m}>
          <span className="legend__swatch" data-state={m === 'write' ? 'write' : 'mark'} /> {MARK_TAG[m]} {MARK_NAME[m]}
        </li>
      ))}
    </ul>
  );
}

/** Bars are drawn from `values`; every highlight comes from the current step. */
export default function BarChart({ values, step, compact = false, label }) {
  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const labelled = !compact && n <= MAX_LABELLED;
  const cols = { gridTemplateColumns: `repeat(${Math.max(n, 1)}, minmax(0, 1fr))` };
  let ranges = step?.ranges ?? null;
  if (!ranges && step?.region) {
    ranges = [{ from: step.region[0], to: step.region[1], label: `Unsorted region, indices ${step.region[0]} to ${step.region[1]}`, tone: 'blue' }];
  }
  ranges = compact || !ranges ? null : ranges.filter((r) => r.from <= r.to);
  const aux = compact ? null : step?.aux;
  const hold = compact ? null : step?.hold;

  return (
    <div
      className={`chart${compact ? ' chart--compact' : ''}`}
      data-many={n > 12 ? '' : undefined}
      role="img"
      aria-label={label ?? `Bar chart of ${n} values: ${values.join(', ')}`}
    >
      {hold && <div className="chart__hold">{hold.label} in hand: <strong>{hold.value}</strong></div>}
      <div className="chart__plot" style={cols}>
        {values.map((v, i) => (
          <div className="bar-cell" key={i}>
            <div className="bar" data-state={stateOf(step, i)} data-mark={step?.marks?.[i]} style={{ height: `${barHeightPercent(v, min, max)}%` }}>
              {labelled && <span className="bar__value">{v}</span>}
            </div>
          </div>
        ))}
      </div>
      {labelled && (
        <div className="chart__axis" style={cols} aria-hidden="true">
          {values.map((_, i) => {
            const state = stateOf(step, i);
            const mark = step?.marks?.[i];
            return (
              <div className="axis-cell" key={i}>
                <span className="axis-cell__index">{i}</span>
                <span className="axis-cell__tag" data-state={state}>
                  {state === 'compare' && 'vs'}
                  {state === 'swap' && <ArrowLeftRight size={12} />}
                  {(state === 'mark' || state === 'write') && MARK_TAG[mark]}
                  {state === 'sorted' && <Check size={12} />}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {ranges && ranges.map((r) => (
        <div className="chart__regions" style={cols} aria-hidden="true" key={`${r.from}-${r.to}-${r.label}`}>
          <div className="chart__region" data-tone={r.tone} style={{ gridColumn: `${r.from + 1} / ${r.to + 2}` }}>{r.label}</div>
        </div>
      ))}
      {aux && (
        <div className="chart__aux" aria-hidden="true">
          <div className="chart__aux-label">Merge buffer: copies of the left (L) and right (R) halves. Dimmed values have been written back.</div>
          <div className="chart__aux-plot" style={cols}>
            {aux.values.map((v, i) => (
              <div className="aux-cell" key={i} style={{ gridColumn: aux.offset + i + 1 }}>
                <div
                  className="aux-bar"
                  data-side={i < aux.leftCount ? 'L' : 'R'}
                  data-state={aux.compare.includes(i) ? 'compare' : aux.consumed[i] ? 'used' : 'default'}
                  style={{ height: `${barHeightPercent(v, min, max)}%` }}
                >
                  {n <= MAX_LABELLED && <span>{v}</span>}
                </div>
                <span className="aux-tag">{i < aux.leftCount ? 'L' : 'R'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
