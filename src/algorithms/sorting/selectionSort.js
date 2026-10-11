import { createRecorder, plural } from './recorder.js';

export const JAVA = {
  lines: [
    'static void selectionSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int min = i;',
    '        for (int j = i + 1; j < n; j++) {',
    '            if (arr[j] < arr[min]) {',
    '                min = j;',
    '            }',
    '        }',
    '        if (min != i) {',
    '            int temp = arr[i];',
    '            arr[i] = arr[min];',
    '            arr[min] = temp;',
    '        }',
    '    }',
    '}',
  ],
  notes: {
    2: 'Store the array length so the loops know where to stop.',
    3: 'Each pass of the outer loop fixes the value at index i, so the sorted part grows from the left.',
    5: 'The inner loop scans the unsorted part, looking for something smaller than the current minimum.',
    6: 'The condition is false here, so the minimum stays where it is.',
    7: 'A smaller value was found, so min now points at index j.',
    10: 'If the minimum is already at index i, there is nothing to swap.',
    11: 'Three assignments (lines 11 to 13) swap arr[i] with the minimum through temp.',
    15: 'Every index has been fixed, so the array is sorted.',
  },
};

export function selectionSortSteps(input) {
  const { a, n, sorted, counts, steps, push, setVars } = createRecorder(input);
  setVars({ n, i: null, j: null, min: null });
  push({
    type: 'start', title: 'Ready', lines: [2],
    text: n <= 1
      ? `The array has ${plural(n, 'element')}, so there is nothing to sort.`
      : 'Selection Sort repeatedly finds the smallest value in the unsorted part and swaps it into the next position from the left.',
  });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    const ranges = [{ from: i, to: n - 1, label: `Unsorted region, indices ${i} to ${n - 1}`, tone: 'blue' }];
    setVars({ n, i, j: null, min });
    push({
      type: 'pass', title: `Pass ${i + 1}`, lines: [3, 4], marks: { [min]: 'min' }, ranges,
      text: `Pass ${i + 1}: assume index ${i} (value ${a[i]}) is the smallest in the unsorted region, then scan for anything smaller.`,
    });
    for (let j = i + 1; j < n; j++) {
      counts.comparisons += 1;
      setVars({ n, i, j, min });
      push({
        type: 'compare', title: 'Compare', lines: [5, 6], compare: [j], marks: { [min]: 'min' }, ranges,
        text: `Comparing arr[${j}] = ${a[j]} with the current minimum arr[${min}] = ${a[min]}.`,
      });
      if (a[j] < a[min]) {
        min = j;
        setVars({ n, i, j, min });
        push({ type: 'new-min', title: 'New minimum', lines: [7], marks: { [min]: 'min' }, ranges,
          text: `${a[j]} is smaller than the old minimum, so index ${j} becomes the new minimum.` });
      } else {
        push({ type: 'keep-min', title: 'Minimum unchanged', lines: [6], marks: { [min]: 'min' }, ranges,
          text: `${a[j]} is not smaller than ${a[min]}, so the minimum stays at index ${min}.` });
      }
    }
    setVars({ n, i, j: null, min });
    if (min !== i) {
      const x = a[i];
      const y = a[min];
      a[i] = y;
      a[min] = x;
      counts.swaps += 1;
      sorted[i] = true;
      push({ type: 'swap', title: 'Swap', lines: [11, 12, 13], swapped: [i, min],
        text: `Swap the minimum ${y} (from index ${min}) with ${x} at index ${i}. Index ${i} now holds its final value.` });
    } else {
      sorted[i] = true;
      push({ type: 'in-place', title: 'Already in place', lines: [10], marks: { [i]: 'min' },
        text: `The minimum ${a[i]} is already at index ${i}, so no swap is needed. Index ${i} is final.` });
    }
  }

  sorted.fill(true);
  setVars({ n, i: null, j: null, min: null });
  push({ type: 'done', title: 'Sorted', lines: [15, 16],
    text: n <= 1 ? 'A single element is already sorted.' : `The array is sorted after ${plural(counts.comparisons, 'comparison')} and ${plural(counts.swaps, 'swap')}.` });
  return steps;
}

export const selectionSort = {
  topicId: 'sort-selection', slug: 'selection', name: 'Selection Sort', difficulty: 'Beginner',
  summary: 'Finds the smallest remaining value on every pass and swaps it into place, growing a sorted section from the left.',
  generateSteps: selectionSortSteps, java: JAVA,
  counters: ['comparisons', 'swaps'], legend: ['min'],
  counterDefs: [
    ['Comparisons', 'each check of arr[j] < arr[min]. Always n(n - 1)/2 in total, whatever the input.'],
    ['Swaps', 'each exchange of two positions. At most one per pass, so at most n - 1.'],
  ],
};
