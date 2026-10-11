export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Shared step recorder. Every pushed step is an immutable snapshot:
 * array, sorted flags (final positions only), highlights, counters, Java lines and explanation.
 * Counters: comparisons, swaps (exchanges of two positions), writes (assignments into the array).
 */
export function createRecorder(input) {
  const a = [...input];
  const n = a.length;
  const sorted = new Array(n).fill(false);
  const counts = { comparisons: 0, swaps: 0, writes: 0 };
  const steps = [];
  let vars = {};
  const push = (step) =>
    steps.push({
      array: [...a],
      sorted: [...sorted],
      compare: null,
      swapped: null,
      region: null,
      ranges: null,
      marks: null,
      aux: null,
      hold: null,
      ...step,
      line: step.lines[0],
      vars: { ...vars },
      comparisons: counts.comparisons,
      swaps: counts.swaps,
      writes: counts.writes,
    });
  return { a, n, sorted, counts, steps, push, setVars: (v) => { vars = v; } };
}
