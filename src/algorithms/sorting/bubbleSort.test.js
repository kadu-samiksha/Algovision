import { describe, expect, test } from 'vitest';
import { bubbleSortSteps } from './bubbleSort.js';

// Independent reference: bubble sort with early exit, counting comparisons and swaps.
function reference(input) {
  const a = [...input];
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - i - 1; j++) {
      comparisons++;
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return { sorted: a, comparisons, swaps };
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
}

function checkSteps(input) {
  const steps = bubbleSortSteps(input);
  const ref = reference(input);
  const first = steps[0];
  const last = steps[steps.length - 1];

  expect(first.array).toEqual(input);
  expect(first.comparisons).toBe(0);
  expect(first.swaps).toBe(0);
  expect(last.array).toEqual(ref.sorted);
  expect(last.sorted.every(Boolean)).toBe(true);
  expect(last.comparisons).toBe(ref.comparisons);
  expect(last.swaps).toBe(ref.swaps);
  expect(steps.filter((s) => s.compare && s.type === 'compare').length).toBe(ref.comparisons);
  expect(steps.filter((s) => s.type === 'swap').length).toBe(ref.swaps);

  for (let k = 1; k < steps.length; k++) {
    const prev = steps[k - 1];
    const s = steps[k];
    expect([...s.array].sort((x, y) => x - y)).toEqual([...input].sort((x, y) => x - y)); // permutation
    expect(s.comparisons).toBeGreaterThanOrEqual(prev.comparisons);
    expect(s.swaps).toBeGreaterThanOrEqual(prev.swaps);
    expect(s.lines.length).toBeGreaterThan(0);
    expect(s.text.length).toBeGreaterThan(0);
    if (s.type === 'swap') {
      const [x, y] = s.swapped;
      expect(s.array[x]).toBe(prev.array[y]);
      expect(s.array[y]).toBe(prev.array[x]);
      expect(prev.array[x]).toBeGreaterThan(prev.array[y]);
      expect(s.swaps).toBe(prev.swaps + 1);
    } else {
      expect(s.array).toEqual(prev.array); // only swap steps change the array
    }
    // sorted flags only ever turn on, and flagged values are already final
    s.sorted.forEach((flag, idx) => {
      if (prev.sorted[idx]) expect(flag).toBe(true);
      if (flag) expect(s.array[idx]).toBe(ref.sorted[idx]);
    });
  }
  return steps;
}

describe('bubbleSortSteps', () => {
  test('every permutation of up to 6 elements, including duplicates', () => {
    for (let n = 0; n <= 6; n++) {
      permutations(Array.from({ length: n }, (_, i) => i)).forEach(checkSteps);
    }
    permutations([2, 2, 1, 1]).forEach(checkSteps);
    permutations([3, -1, 3, 0, -1]).forEach(checkSteps);
  });

  test('random arrays with negatives and duplicates', () => {
    for (let t = 0; t < 40; t++) {
      const n = 1 + Math.floor(Math.random() * 20);
      checkSteps(Array.from({ length: n }, () => Math.floor(Math.random() * 41) - 20));
    }
  });

  test('empty and single-element arrays give a start and done step', () => {
    expect(bubbleSortSteps([]).map((s) => s.type)).toEqual(['start', 'done']);
    const one = bubbleSortSteps([7]);
    expect(one.map((s) => s.type)).toEqual(['start', 'done']);
    expect(one[1].sorted).toEqual([true]);
  });

  test('already sorted array stops after one pass with zero swaps', () => {
    const steps = bubbleSortSteps([1, 2, 3, 4, 5]);
    const last = steps[steps.length - 1];
    expect(last.comparisons).toBe(4);
    expect(last.swaps).toBe(0);
    expect(steps.some((s) => s.type === 'early-exit')).toBe(true);
  });

  test('reverse sorted array needs n(n-1)/2 comparisons and swaps', () => {
    const last = bubbleSortSteps([5, 4, 3, 2, 1]).at(-1);
    expect(last.comparisons).toBe(10);
    expect(last.swaps).toBe(10);
  });

  test('does not mutate its input', () => {
    const input = [3, 1, 2];
    bubbleSortSteps(input);
    expect(input).toEqual([3, 1, 2]);
  });

  test('explanations reference the real values and indices', () => {
    const steps = bubbleSortSteps([9, 4]);
    expect(steps.find((s) => s.type === 'compare').text).toContain('indices 0 and 1: 9 and 4');
    expect(steps.find((s) => s.type === 'swap').text).toContain('9 is larger than 4');
  });
});
