export const MIN_SIZE = 2;
export const MAX_SIZE = 40;
export const DEFAULT_SIZE = 12;

export const PATTERNS = [
  { id: 'random', label: 'Random' },
  { id: 'sorted', label: 'Already sorted' },
  { id: 'reversed', label: 'Reverse sorted' },
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function generateArray(size, pattern = 'random', min = 5, max = 99) {
  const values = Array.from({ length: size }, () => randInt(min, max));
  if (pattern === 'sorted') return values.sort((a, b) => a - b);
  if (pattern === 'reversed') return values.sort((a, b) => b - a);
  return values;
}

/**
 * Bar height as a percentage of the plot area.
 * Non-negative arrays scale from zero, so height is proportional to value.
 * Arrays with negatives scale from the smallest value so every bar stays visible.
 */
export function barHeightPercent(value, min, max) {
  if (max === min) return 60;
  if (min >= 0) return Math.max(8, (value / max) * 100);
  return 8 + ((value - min) / (max - min)) * 92;
}
