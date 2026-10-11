import { describe, expect, test } from 'vitest';
import { binarySearchSteps, linearSearchSteps, isSortedAscending, SEARCH_ALGORITHMS } from './search.js';

const rnd = (n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));

function checkCommon(entry, steps, array, target) {
  const last = steps.at(-1);
  expect(['found', 'not-found']).toContain(last.result);
  expect(steps.filter((s) => s.type === 'compare').length).toBe(last.comparisons);
  steps.forEach((s, k) => {
    expect(s.array).toEqual(array);
    expect(entry.java.notes[s.line], `${entry.slug} line ${s.line}`).toBeTruthy();
    expect(s.text.length).toBeGreaterThan(0);
    if (k > 0) {
      steps[k - 1].eliminated.forEach((e, i) => e && expect(s.eliminated[i]).toBe(true));
      expect(s.comparisons - steps[k - 1].comparisons).toBe(s.type === 'compare' ? 1 : 0);
    }
    if (s.found !== null) expect(array[s.found]).toBe(target);
  });
  return last;
}

describe('linear search', () => {
  test('matches indexOf for present, absent and duplicate targets', () => {
    for (let t = 0; t < 200; t++) {
      const array = rnd(Math.floor(Math.random() * 12), -5, 5);
      const target = Math.floor(Math.random() * 13) - 6;
      const steps = linearSearchSteps(array, target);
      const last = checkCommon(SEARCH_ALGORITHMS.linear, steps, array, target);
      const idx = array.indexOf(target);
      expect(last.result).toBe(idx === -1 ? 'not-found' : 'found');
      expect(last.found).toBe(idx === -1 ? null : idx);
      expect(last.comparisons).toBe(idx === -1 ? array.length : idx + 1);
    }
  });
  test('empty array is unsuccessful', () => {
    const last = linearSearchSteps([], 3).at(-1);
    expect(last.result).toBe('not-found');
    expect(last.comparisons).toBe(0);
  });
});

describe('binary search', () => {
  test('finds an index holding the target, or reports absence, in at most log2(n)+1 comparisons', () => {
    for (let t = 0; t < 300; t++) {
      const array = rnd(Math.floor(Math.random() * 20), -8, 8).sort((a, b) => a - b);
      const target = Math.floor(Math.random() * 19) - 9;
      const steps = binarySearchSteps(array, target);
      const last = checkCommon(SEARCH_ALGORITHMS.binary, steps, array, target);
      if (array.includes(target)) {
        expect(last.result).toBe('found');
        expect(array[last.found]).toBe(target);
      } else {
        expect(last.result).toBe('not-found');
      }
      expect(last.comparisons).toBeLessThanOrEqual(Math.floor(Math.log2(Math.max(array.length, 1))) + 1);
      // eliminated indices never contain the target
      steps.forEach((s) => s.eliminated.forEach((e, i) => e && expect(array[i]).not.toBe(target)));
    }
  });
  test('rejects unsorted input instead of silently sorting', () => {
    expect(SEARCH_ALGORITHMS.binary.validate([3, 1, 2])).toMatch(/sorted/);
    expect(SEARCH_ALGORITHMS.binary.validate([1, 2, 2, 3])).toBeNull();
    expect(isSortedAscending([])).toBe(true);
  });
  test('single element and empty array', () => {
    expect(binarySearchSteps([4], 4).at(-1).found).toBe(0);
    expect(binarySearchSteps([4], 5).at(-1).result).toBe('not-found');
    expect(binarySearchSteps([], 5).at(-1).result).toBe('not-found');
  });
  test('explains why a half is discarded', () => {
    const s = binarySearchSteps([1, 3, 5, 7, 9], 9).find((x) => x.type === 'eliminate-left');
    expect(s.text).toContain('sorted');
    expect(s.text).toContain('cannot be the target');
  });
});
