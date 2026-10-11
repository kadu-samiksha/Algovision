import { usePlayback } from './usePlayback.js';

/** Binds a recorded step list to playback and exposes the current step. */
export function useVisualization(steps, speedMs) {
  const playback = usePlayback(steps.length, speedMs, steps);
  return { ...playback, steps, current: steps[playback.index], totalSteps: steps.length - 1 };
}
