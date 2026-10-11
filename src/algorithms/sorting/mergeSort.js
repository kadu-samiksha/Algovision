import { createRecorder, plural } from './recorder.js';

export const JAVA = {
  lines: [
    'static void mergeSort(int[] arr, int lo, int hi) {',
    '    if (lo >= hi) return;',
    '    int mid = (lo + hi) / 2;',
    '    mergeSort(arr, lo, mid);',
    '    mergeSort(arr, mid + 1, hi);',
    '    merge(arr, lo, mid, hi);',
    '}',
    '',
    'static void merge(int[] arr, int lo, int mid, int hi) {',
    '    int[] left = Arrays.copyOfRange(arr, lo, mid + 1);',
    '    int[] right = Arrays.copyOfRange(arr, mid + 1, hi + 1);',
    '    int i = 0, j = 0, k = lo;',
    '    while (i < left.length && j < right.length) {',
    '        if (left[i] <= right[j]) arr[k++] = left[i++];',
    '        else arr[k++] = right[j++];',
    '    }',
    '    while (i < left.length) arr[k++] = left[i++];',
    '    while (j < right.length) arr[k++] = right[j++];',
    '}',
  ],
  notes: {
    1: 'mergeSort(arr, 0, n - 1) sorts the whole array by splitting it in half recursively.',
    3: 'Find the middle index, then recurse on the left half (line 4) and the right half (line 5).',
    7: 'The recursion has finished and the whole array has been merged into sorted order.',
    10: 'Copy the two sorted halves into buffers so the merge can overwrite the original slots.',
    13: 'Compare the front values of the two halves. The smaller one is written next.',
    14: 'The left front value is smaller or equal, so it is written to arr[k]. Using <= keeps the sort stable.',
    15: 'The right front value is smaller, so it is written to arr[k].',
    17: 'The right half is used up, so the rest of the left half is copied as it is.',
    18: 'The left half is used up, so the rest of the right half is copied as it is.',
    19: 'The two halves are now merged into one sorted run.',
  },
};

export function mergeSortSteps(input) {
  const { a, n, sorted, counts, steps, push, setVars } = createRecorder(input);
  const vars = (o) => setVars({ lo: null, hi: null, mid: null, i: null, j: null, k: null, ...o });
  vars({});
  push({
    type: 'start', title: 'Ready', lines: [1],
    text: n <= 1
      ? `The array has ${plural(n, 'element')}, so there is nothing to sort.`
      : 'Merge Sort splits the array in half until single elements remain, then merges sorted halves back together.',
  });

  function merge(lo, mid, hi) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    const buf = [...left, ...right];
    const consumed = new Array(buf.length).fill(false);
    const aux = (cmp = []) => ({ offset: lo, values: [...buf], consumed: [...consumed], compare: cmp, leftCount: left.length });
    const range = (label, tone) => [{ from: lo, to: hi, label, tone }];
    let i = 0;
    let j = 0;
    let k = lo;
    vars({ lo, hi, mid, i, j, k });
    push({ type: 'merge-start', title: 'Merge', lines: [10, 11, 12], aux: aux(), ranges: range(`Merging indices ${lo} to ${hi}`, 'violet'),
      text: `Both halves are sorted. Copy them into a buffer, then merge back into indices ${lo} to ${hi} by repeatedly taking the smaller front value.` });

    while (i < left.length && j < right.length) {
      counts.comparisons += 1;
      push({ type: 'compare', title: 'Compare', lines: [13, 14], aux: aux([i, left.length + j]), ranges: range(`Merging indices ${lo} to ${hi}`, 'violet'),
        text: `Comparing the front of the left half (${left[i]}) with the front of the right half (${right[j]}).` });
      if (left[i] <= right[j]) {
        const v = left[i];
        a[k] = v;
        consumed[i] = true;
        counts.writes += 1;
        i += 1; k += 1;
        vars({ lo, hi, mid, i, j, k });
        push({ type: 'write', title: 'Write from left', lines: [14], marks: { [k - 1]: 'write' }, aux: aux(), ranges: range(`Merging indices ${lo} to ${hi}`, 'violet'),
          text: `${v} is not larger than ${right[j]}, so ${v} (from the left half) is written to index ${k - 1}. Using <= keeps equal values in their original order.` });
      } else {
        const v = right[j];
        a[k] = v;
        consumed[left.length + j] = true;
        counts.writes += 1;
        j += 1; k += 1;
        vars({ lo, hi, mid, i, j, k });
        push({ type: 'write', title: 'Write from right', lines: [15], marks: { [k - 1]: 'write' }, aux: aux(), ranges: range(`Merging indices ${lo} to ${hi}`, 'violet'),
          text: `${v} is smaller than ${left[i]}, so ${v} (from the right half) is written to index ${k - 1}.` });
      }
    }
    while (i < left.length) {
      const v = left[i];
      a[k] = v; consumed[i] = true; counts.writes += 1; i += 1; k += 1;
      vars({ lo, hi, mid, i, j, k });
      push({ type: 'copy-rest', title: 'Copy the rest', lines: [17], marks: { [k - 1]: 'write' }, aux: aux(), ranges: range(`Merging indices ${lo} to ${hi}`, 'violet'),
        text: `The right half is used up, so the remaining ${v} from the left half is copied to index ${k - 1}.` });
    }
    while (j < right.length) {
      const v = right[j];
      a[k] = v; consumed[left.length + j] = true; counts.writes += 1; j += 1; k += 1;
      vars({ lo, hi, mid, i, j, k });
      push({ type: 'copy-rest', title: 'Copy the rest', lines: [18], marks: { [k - 1]: 'write' }, aux: aux(), ranges: range(`Merging indices ${lo} to ${hi}`, 'violet'),
        text: `The left half is used up, so the remaining ${v} from the right half is copied to index ${k - 1}.` });
    }
    push({ type: 'merged', title: 'Merged', lines: [19], ranges: range(`Sorted subarray, indices ${lo} to ${hi}`, 'green'),
      text: `Indices ${lo} to ${hi} are now one sorted run: ${a.slice(lo, hi + 1).join(', ')}.` });
  }

  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    vars({ lo, hi, mid });
    push({ type: 'split', title: 'Split', lines: [3],
      ranges: [
        { from: lo, to: mid, label: `Left half, indices ${lo} to ${mid}`, tone: 'blue' },
        { from: mid + 1, to: hi, label: `Right half, indices ${mid + 1} to ${hi}`, tone: 'violet' },
      ],
      text: `Split indices ${lo} to ${hi} at the middle (index ${mid}). The left half is sorted first, then the right half, then the two are merged.` });
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  sort(0, n - 1);
  sorted.fill(true);
  vars({});
  push({ type: 'done', title: 'Sorted', lines: [7],
    text: n <= 1 ? 'A single element is already sorted.' : `The array is sorted after ${plural(counts.comparisons, 'comparison')} and ${plural(counts.writes, 'write')}.` });
  return steps;
}

export const mergeSort = {
  topicId: 'sort-merge', slug: 'merge', name: 'Merge Sort', difficulty: 'Intermediate',
  summary: 'Splits the array in half, sorts each half recursively, then merges the two sorted halves into one.',
  generateSteps: mergeSortSteps, java: JAVA,
  counters: ['comparisons', 'writes'], legend: ['write'],
  counterDefs: [
    ['Comparisons', 'each comparison of the two front values, left[i] <= right[j].'],
    ['Writes', 'each assignment into the original array while merging. The buffer copies are not counted. Merge Sort does not swap, so swaps are not counted.'],
  ],
};
