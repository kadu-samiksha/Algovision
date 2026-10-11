import { SPEEDS } from '../hooks/usePlayback.js';
import { getInitials, useProgress } from '../context/ProgressContext.jsx';

export default function Settings() {
  const { state, setPref } = useProgress();
  const { displayName, speed } = state.prefs;
  return (
    <div className="page">
      <div className="page__head">
        <h1>Settings</h1>
        <p>Preferences are stored in this browser only.</p>
      </div>
      <section className="card settings" aria-label="Preferences">
        <label className="field">
          <span className="field__label">Display name (optional)</span>
          <input className="input" value={displayName} maxLength={40} autoComplete="off"
            onChange={(e) => setPref('displayName', e.target.value)} aria-describedby="name-hint" />
          <span id="name-hint" className="field-hint">Used only for the initials ({getInitials(displayName)}) in the top bar. No account is created.</span>
        </label>
        <label className="field">
          <span className="field__label">Default animation speed <output>{SPEEDS[speed - 1].label}</output></span>
          <input type="range" min={1} max={SPEEDS.length} value={speed} aria-label="Default animation speed"
            aria-valuetext={SPEEDS[speed - 1].label} onChange={(e) => setPref('speed', Number(e.target.value))} />
        </label>
      </section>
    </div>
  );
}
