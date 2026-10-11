import { createRecorder, plural } from './recorder.js';

export const JAVA = {
  lines: [
    'static void quickSort(int[] arr, int lo, int hi) {',
    '    if (lo < hi) {',
    '        int p = partition(arr, lo, hi);',
    '        quickSort(arr, lo, p - 1);',
    '        quickSort(arr, p + 1, hi);',
    '    }',
    '}',
    '',
    'static int partition(int[] arr, int lo, int hi) {',
    '    int pivot = arr[hi];',
    '    int i = lo - 1;',
    '    for (int j = lo; j < hi; j++) {',
    '        if (arr[j] < pivot) {',
    '            i++;',
    '            swap(arr, i, j);',
    '        }',
    '    }',
    '    swap(arr, i + 1, hi);',
    '    return i + 1;',
    '}',
  ],
  notes: {
    1: 'quickSort picks a pivot, partitions around it, then sorts the two sides recursively.',
    2: 'Fewer than two elements means the range is already sorted, so the recursion stops.',
    7: 'Every partition has placed its pivot, so the whole array is sorted.',
    10: 'The last element of the range is the pivot. i tracks the end of the "smaller than pivot" group.',
    12: 'The element is not smaller than the pivot, so it stays in the "greater or equal" group.',
    13: 'The element is smaller than the pivot: grow the small group (i++) and swap it into that group.',
    14: 'Grow the smaller group (i++) and swap the element into it, unless it is already at position i.',
    18: 'Swap the pivot into the gap between the two groups. It is now in its final sorted position.',
  },
};

export function quickSortSteps(input) {
  const { a, n, sorted, counts, steps, push, setVars } = createRecorder(input);
  const vars = (o) => setVars({ lo: null, hi: null, pivot: null, i: null, j: null, p: null, ...o });
  vars({});
  push({
    type: 'start', title: 'Ready', lines: [1],
    text: n <= 1
      ? `The array has ${plural(n, 'element')}, so there is nothing to sort.`
      : 'Quick Sort picks the last element as the pivot, moves smaller values to its left and the rest to its right, then repeats on each side.',
  });

  const groups = (lo, hi, i, j) => {
    const out = [];
    if (i >= lo) out.push({ from: lo, to: i, label: 'Smaller than pivot', tone: 'blue' });
    if (j - 1 >= i + 1) out.push({ from: i + 1, to: j - 1, label: 'Greater or equal', tone: 'violet' });
    if (hi - 1 >= j) out.push({ from: j, to: hi - 1, label: 'Not checked yet', tone: 'muted' });
    return out;
  };

  function partition(lo, hi) {
    const pivot = a[hi];
    let i = lo - 1;
    vars({ lo, hi, pivot, i, j: lo });
    push({ type: 'partition', title: 'Partition', lines: [10, 11], marks: { [hi]: 'pivot' }, ranges: groups(lo, hi, i, lo),
      text: `Partition indices ${lo} to ${hi} around the pivot ${pivot} (the last element, index ${hi}).` });
    for (let j = lo; j < hi; j++) {
      counts.comparisons += 1;
      vars({ lo, hi, pivot, i, j });
      push({ type: 'compare', title: 'Compare', lines: [12, 13], compare: [j], marks: { [hi]: 'pivot' }, ranges: groups(lo, hi, i, j),
        text: `Comparing arr[${j}] = ${a[j]} with the pivot ${pivot}.` });
      if (a[j] < pivot) {
        i += 1;
        vars({ lo, hi, pivot, i, j });
        if (i !== j) {
          const x = a[i];
          const y = a[j];
          a[i] = y;
          a[j] = x;
          counts.swaps += 1;
          push({ type: 'swap', title: 'Swap', lines: [14, 15], swapped: [i, j], marks: { [hi]: 'pivot' }, ranges: groups(lo, hi, i, j + 1),
            text: `${y} is smaller than the pivot, so it joins the smaller group: swap indices ${i} and ${j}.` });
        } else {
          push({ type: 'keep', title: 'Already in place', lines: [14, 15], marks: { [hi]: 'pivot' }, ranges: groups(lo, hi, i, j + 1),
            text: `${a[j]} is smaller than the pivot and i equals j, so it is already at the end of the smaller group. Nothing moves.` });
        }
      } else {
        push({ type: 'skip', title: 'Not smaller', lines: [12], marks: { [hi]: 'pivot' }, ranges: groups(lo, hi, i, j + 1),
          text: `${a[j]} is not smaller than ${pivot}, so it stays in the greater-or-equal group.` });
      }
    }
    const p = i + 1;
    vars({ lo, hi, pivot, i, j: hi, p });
    if (p !== hi) {
      const x = a[p];
      const y = a[hi];
      a[p] = y;
      a[hi] = x;
      counts.swaps += 1;
      sorted[p] = true;
      push({ type: 'place-pivot', title: 'Place the pivot', lines: [18, 19], swapped: [p, hi],
        ranges: [{ from: lo, to: p - 1, label: 'Smaller than pivot', tone: 'blue' }, { from: p + 1, to: hi, label: 'Greater or equal', tone: 'violet' }].filter((r) => r.from <= r.to),
        text: `Swap the pivot ${y} into index ${p}, between the two groups. It is now in its final position.` });
    } else {
      sorted[p] = true;
      push({ type: 'place-pivot', title: 'Place the pivot', lines: [18, 19], marks: { [p]: 'pivot' },
        ranges: [{ from: lo, to: p - 1, label: 'Smaller than pivot', tone: 'blue' }].filter((r) => r.from <= r.to),
        text: `Every value was smaller than the pivot ${a[p]}, so it already sits at index ${p}. It is in its final position.` });
    }
    return p;
  }

  function sort(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) {
      sorted[lo] = true;
      vars({ lo, hi });
      push({ type: 'single', title: 'Single element', lines: [2], marks: { [lo]: 'pivot' },
        text: `Index ${lo} is a range of one element, so it is already in its final position.` });
      return;
    }
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  }

  sort(0, n - 1);
  sorted.fill(true);
  vars({});
  push({ type: 'done', title: 'Sorted', lines: [7],
    text: n <= 1 ? 'A single element is already sorted.' : `The array is sorted after ${plural(counts.comparisons, 'comparison')} and ${plural(counts.swaps, 'swap')}.` });
  return steps;
}

export const quickSort = {
  topicId: 'sort-quick', slug: 'quick', name: 'Quick Sort', difficulty: 'Intermediate',
  summary: 'Partitions the array around a pivot so smaller values end up on its left and the rest on its right, then sorts each side.',
  generateSteps: quickSortSteps, java: JAVA,
  counters: ['comparisons', 'swaps'], legend: ['pivot'],
  counterDefs: [
    ['Comparisons', 'each check of arr[j] < pivot.'],
    ['Swaps', 'each exchange of two different positions. When i equals j nothing moves, so nothing is counted.'],
  ],
};
