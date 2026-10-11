import { describe, expect, test } from 'vitest';
import { SORTING_ALGORITHMS } from './index.js';

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
}
const asc = (x, y) => x - y;
const diffs = (p, q) => p.reduce((acc, v, i) => (v !== q[i] ? [...acc, i] : acc), []);

function check(entry, input) {
  const steps = entry.generateSteps(input);
  const expected = [...input].sort(asc);
  const first = steps[0];
  const last = steps.at(-1);
  expect(first.array).toEqual(input);
  expect([first.comparisons, first.swaps, first.writes]).toEqual([0, 0, 0]);
  expect(last.array).toEqual(expected);
  expect(last.sorted.every(Boolean)).toBe(true);

  for (let k = 0; k < steps.length; k++) {
    const s = steps[k];
    expect(s.lines.length).toBeGreaterThan(0);
    s.lines.forEach((l) => expect(l).toBeGreaterThanOrEqual(1) && expect(l).toBeLessThanOrEqual(entry.java.lines.length));
    expect(entry.java.notes[s.line], `${entry.slug}: no note for line ${s.line} (${s.type})`).toBeTruthy();
    expect(s.text.length).toBeGreaterThan(0);
    // The key held in hand (insertion sort) or the merge buffer holds values the array has temporarily overwritten from the array, so skip the multiset check then.
    if (!s.hold && !s.aux) expect([...s.array].sort(asc)).toEqual(expected);
    s.sorted.forEach((flag, i) => { if (flag) expect(s.array[i]).toBe(expected[i]); }); // flagged = final
    if (k === 0) continue;
    const p = steps[k - 1];
    const dc = s.comparisons - p.comparisons;
    const ds = s.swaps - p.swaps;
    const dw = s.writes - p.writes;
    expect(dc === 1).toBe(s.type === 'compare');
    expect([dc, ds, dw].every((d) => d === 0 || d === 1)).toBe(true);
    expect(dc + ds + dw).toBeLessThanOrEqual(1);
    p.sorted.forEach((flag, i) => { if (flag) expect(s.sorted[i]).toBe(true); }); // flags never turn off
    const changed = diffs(p.array, s.array);
    if (ds === 1) {
      expect(s.swapped).toHaveLength(2);
      const [x, y] = s.swapped;
      expect(s.array[x]).toBe(p.array[y]);
      expect(s.array[y]).toBe(p.array[x]);
    } else if (dw === 1) {
      expect(changed.length).toBeLessThanOrEqual(1);
    } else {
      expect(changed).toEqual([]);
    }
    if (entry.counters.includes('swaps') && !entry.counters.includes('writes')) expect(dw).toBe(0);
    if (entry.counters.includes('writes') && !entry.counters.includes('swaps')) expect(ds).toBe(0);
  }
  expect(steps.filter((s) => s.type === 'compare').length).toBe(last.comparisons);
  return last;
}

describe.each(Object.values(SORTING_ALGORITHMS))('$name', (entry) => {
  test('sorts every permutation up to 6 elements, with duplicates', () => {
    for (let n = 0; n <= 6; n++) permutations(Array.from({ length: n }, (_, i) => i)).forEach((p) => check(entry, p));
    permutations([2, 2, 1, 1]).forEach((p) => check(entry, p));
    permutations([3, -1, 3, 0, -1]).forEach((p) => check(entry, p));
  });
  test('random arrays with negatives', () => {
    for (let t = 0; t < 25; t++) {
      const n = 1 + Math.floor(Math.random() * 20);
      check(entry, Array.from({ length: n }, () => Math.floor(Math.random() * 41) - 20));
    }
  });
  test('handles sorted, reversed and the maximum size of 40', () => {
    const up = Array.from({ length: 40 }, (_, i) => i);
    check(entry, up);
    check(entry, [...up].reverse());
    check(entry, Array.from({ length: 40 }, () => 7));
  });
  test('does not mutate its input and empty/single arrays work', () => {
    const input = [3, 1, 2];
    entry.generateSteps(input);
    expect(input).toEqual([3, 1, 2]);
    expect(entry.generateSteps([]).at(-1).array).toEqual([]);
    expect(entry.generateSteps([9]).at(-1).sorted).toEqual([true]);
  });
});

describe('known counts', () => {
  const run = (slug, arr) => SORTING_ALGORITHMS[slug].generateSteps(arr).at(-1);
  test('selection sort always does n(n-1)/2 comparisons', () => {
    expect(run('selection', [5, 4, 3, 2, 1]).comparisons).toBe(10);
    expect(run('selection', [1, 2, 3, 4, 5]).comparisons).toBe(10);
    expect(run('selection', [1, 2, 3, 4, 5]).swaps).toBe(0);
  });
  test('insertion sort on sorted input makes n-1 comparisons and n-1 writes', () => {
    const r = run('insertion', [1, 2, 3, 4, 5]);
    expect([r.comparisons, r.writes]).toEqual([4, 4]);
  });
  test('insertion sort on reversed input makes n(n-1)/2 comparisons', () => {
    expect(run('insertion', [5, 4, 3, 2, 1]).comparisons).toBe(10);
  });
  test('merge sort of 2 elements: one comparison, two writes', () => {
    const r = run('merge', [2, 1]);
    expect([r.comparisons, r.writes]).toEqual([1, 2]);
  });
  test('merge sort steps expose a buffer while merging', () => {
    const steps = SORTING_ALGORITHMS.merge.generateSteps([3, 1, 2]);
    expect(steps.some((s) => s.aux && s.aux.values.length > 0)).toBe(true);
  });
});
