import { Shuffle, Check } from 'lucide-react';
import { MIN_SIZE, MAX_SIZE, PATTERNS } from '../utils/arrays.js';

export default function ArrayControls({
  options, currentSlug, onAlgorithm, size, onSize, pattern, onPattern, onGenerate, draft, onDraft, onApply, error, locked,
}) {
  return (
    <div className="array-controls">
      <div className="array-controls__row">
        <label className="field">
          <span className="field__label">Algorithm</span>
          <select className="select" value={currentSlug} onChange={(e) => onAlgorithm(e.target.value)}>
            {options.map((t) => (
              <option key={t.id} value={t.slug} disabled={!t.available}>
                {t.title}{t.available ? '' : ' (coming soon)'}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Array size <output>{size}</output></span>
          <input
            type="range" min={MIN_SIZE} max={MAX_SIZE} value={size} disabled={locked}
            onChange={(e) => onSize(Number(e.target.value))} aria-label="Array size"
            title={locked ? 'Pause or reset to change the array' : 'Generates a new array of this size'}
          />
        </label>
        <label className="field">
          <span className="field__label">Array pattern</span>
          <select className="select" value={pattern} disabled={locked} onChange={(e) => onPattern(e.target.value)}
            title="Choose the starting order, for example to test already sorted or reversed input">
            {PATTERNS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <div className="field">
          <span className="field__label" aria-hidden="true">&nbsp;</span>
          <button type="button" className="btn" onClick={onGenerate} disabled={locked} title={locked ? 'Pause or reset to change the array' : 'Generate a new array (G)'}>
            <Shuffle /> Generate array
          </button>
        </div>
      </div>
      <form
        className="array-controls__custom"
        onSubmit={(e) => { e.preventDefault(); onApply(); }}
        noValidate
      >
        <label className="field">
          <span className="field__label">Custom array (whole numbers, -999 to 999, up to {MAX_SIZE})</span>
          <input
            className="input mono" value={draft} disabled={locked}
            onChange={(e) => onDraft(e.target.value)}
            placeholder="e.g. 34, 7, 23, 32, 5, 62"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'array-error' : undefined}
            inputMode="numeric" autoComplete="off" spellCheck="false"
          />
        </label>
        <button type="submit" className="btn" disabled={locked}><Check /> Use this array</button>
      </form>
      {error && <p id="array-error" role="alert" className="field-error">{error}</p>}
      {locked && <p className="field-hint">Array controls are locked while the animation plays. Pause or reset to edit.</p>}
    </div>
  );
}
