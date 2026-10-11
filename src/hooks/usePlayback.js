import { useCallback, useEffect, useState } from 'react';

export const SPEEDS = [
  { label: 'Very slow', ms: 1400 },
  { label: 'Slow', ms: 850 },
  { label: 'Normal', ms: 480 },
  { label: 'Fast', ms: 220 },
  { label: 'Very fast', ms: 80 },
];

/**
 * Playback over a fixed list of recorded steps.
 * State is only { index, playing }. Everything else is derived.
 * `resetKey` (e.g. the steps array) rewinds and stops playback whenever it changes.
 * A single timeout exists at a time and is cleared on pause, seek, speed change and unmount.
 */
export function usePlayback(totalSteps, speedMs, resetKey) {
  const last = Math.max(totalSteps - 1, 0);
  let current = null;
  const [state, setState] = useState({ index: 0, playing: false, key: resetKey });

  if (state.key !== resetKey) {
    // Adjust state during render when the recorded steps change.
    current = { index: 0, playing: false, key: resetKey };
    setState(current);
  } else {
    current = state;
  }

  const index = Math.min(current.index, last);
  const playing = current.playing && last > 0;

  const play = useCallback(
    () => setState((p) => ({ ...p, index: p.index >= last ? 0 : p.index, playing: last > 0 })),
    [last],
  );
  const pause = useCallback(() => setState((p) => (p.playing ? { ...p, playing: false } : p)), []);
  const toggle = useCallback(
    () =>
      setState((p) =>
        p.playing ? { ...p, playing: false } : { ...p, index: p.index >= last ? 0 : p.index, playing: last > 0 },
      ),
    [last],
  );
  const next = useCallback(
    () => setState((p) => ({ ...p, playing: false, index: Math.min(p.index + 1, last) })),
    [last],
  );
  const prev = useCallback(() => setState((p) => ({ ...p, playing: false, index: Math.max(p.index - 1, 0) })), []);
  const reset = useCallback(() => setState((p) => ({ ...p, playing: false, index: 0 })), []);
  const seek = useCallback(
    (i) => setState((p) => ({ ...p, playing: false, index: Math.min(Math.max(Math.trunc(i) || 0, 0), last) })),
    [last],
  );

  useEffect(() => {
    if (!playing) return undefined;
    if (index >= last) {
      setState((p) => ({ ...p, playing: false }));
      return undefined;
    }
    const id = setTimeout(() => setState((p) => ({ ...p, index: Math.min(p.index + 1, last) })), speedMs);
    return () => clearTimeout(id);
  }, [playing, index, last, speedMs]);

  return { index, playing, atStart: index === 0, atEnd: index >= last, play, pause, toggle, next, prev, reset, seek };
}
