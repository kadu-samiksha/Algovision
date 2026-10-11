import { Play, Pause, StepBack, StepForward, RotateCcw } from 'lucide-react';
import { SPEEDS } from '../hooks/usePlayback.js';

export default function VisualizationControls({ playback, speed, onSpeed, totalSteps, disabled = false }) {
  const { playing, atStart, atEnd, index } = playback;
  return (
    <div className="playback" role="group" aria-label="Playback controls">
      <div className="playback__buttons">
        <button type="button" className="btn" onClick={playback.prev} disabled={disabled || atStart} aria-label="Previous step" title="Previous step (Left arrow)">
          <StepBack /> Previous
        </button>
        <button type="button" className="btn btn--primary" onClick={playback.play} disabled={disabled || playing} title="Play (Space)">
          <Play /> {atEnd && !atStart ? 'Replay' : 'Play'}
        </button>
        <button type="button" className="btn" onClick={playback.pause} disabled={disabled || !playing} title="Pause (Space)">
          <Pause /> Pause
        </button>
        <button type="button" className="btn" onClick={playback.next} disabled={disabled || atEnd} aria-label="Next step" title="Next step (Right arrow)">
          Next <StepForward />
        </button>
        <button type="button" className="btn" onClick={playback.reset} disabled={disabled || (atStart && !playing)} title="Reset to the first step (R)">
          <RotateCcw /> Reset
        </button>
      </div>
      <label className="field playback__scrub">
        <span className="field__label">
          Step <output>{index} / {totalSteps}</output>
        </span>
        <input
          type="range"
          min={0}
          max={totalSteps}
          value={index}
          disabled={disabled}
          onChange={(e) => playback.seek(Number(e.target.value))}
          aria-label="Jump to step"
          aria-valuetext={`Step ${index} of ${totalSteps}`}
        />
      </label>
      <label className="field playback__speed">
        <span className="field__label">
          Speed <output>{SPEEDS[speed - 1].label}</output>
        </span>
        <input
          type="range"
          min={1}
          max={SPEEDS.length}
          step={1}
          value={speed}
          onChange={(e) => onSpeed(Number(e.target.value))}
          aria-label="Animation speed"
          aria-valuetext={SPEEDS[speed - 1].label}
          title="Animation speed. Takes effect immediately, even while playing."
        />
      </label>
    </div>
  );
}
