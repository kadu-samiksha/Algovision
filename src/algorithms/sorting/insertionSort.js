import { createRecorder, plural } from './recorder.js';

export const JAVA = {
  lines: [
    'static void insertionSort(int[] arr) {',
    '    for (int i = 1; i < arr.length; i++) {',
    '        int key = arr[i];',
    '        int j = i - 1;',
    '        while (j >= 0 && arr[j] > key) {',
    '            arr[j + 1] = arr[j];',
    '            j--;',
    '        }',
    '        arr[j + 1] = key;',
    '    }',
    '}',
  ],
  notes: {
    2: 'Index 0 is a sorted section of one element. Each pass inserts the next element into it.',
    3: 'Pick up the next element as the key. Its slot becomes a hole that larger values will shift into.',
    5: 'Compare the element to the left with the key. The loop ends when it is not larger or when j reaches -1.',
    6: 'The left element is larger, so it shifts one slot right. This is a write, not a swap.',
    9: 'Drop the key into the hole at j + 1. The sorted section is now one element longer.',
    10: 'All elements have been inserted, so the array is sorted.',
  },
};

export function insertionSortSteps(input) {
  const { a, n, sorted, counts, steps, push, setVars } = createRecorder(input);
  setVars({ n, i: null, j: null, key: null });
  push({
    type: 'start', title: 'Ready', lines: [2],
    text: n <= 1
      ? `The array has ${plural(n, 'element')}, so there is nothing to sort.`
      : 'Insertion Sort grows a sorted section from the left. Each new element is slid left until it sits in the right place.',
  });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    const portion = (to) => [{ from: 0, to, label: `Sorted portion, indices 0 to ${to}`, tone: 'green' }];
    const hold = { label: 'Key', value: key };
    setVars({ n, i, j, key });
    push({ type: 'pick', title: 'Pick the key', lines: [3, 4], marks: { [i]: 'key' }, ranges: portion(i - 1), hold,
      text: `Pick up the key ${key} from index ${i}. It will be inserted into the sorted portion on its left (indices 0 to ${i - 1}).` });

    while (j >= 0) {
      counts.comparisons += 1;
      setVars({ n, i, j, key });
      push({ type: 'compare', title: 'Compare', lines: [5], compare: [j], marks: { [j + 1]: 'hole' }, ranges: portion(i - 1), hold,
        text: `Comparing arr[${j}] = ${a[j]} with the key ${key}.` });
      if (a[j] > key) {
        a[j + 1] = a[j];
        counts.writes += 1;
        push({ type: 'shift', title: 'Shift right', lines: [6, 7], marks: { [j + 1]: 'write' }, ranges: portion(i - 1), hold,
          text: `${a[j]} is larger than ${key}, so it shifts one slot to the right (a write to index ${j + 1}).` });
        j -= 1;
        setVars({ n, i, j, key });
      } else {
        push({ type: 'stop', title: 'Found the spot', lines: [5], marks: { [j + 1]: 'hole' }, ranges: portion(i - 1), hold,
          text: `${a[j]} is not larger than ${key}, so the key belongs right after index ${j}. Equal values are not passed, which keeps the sort stable.` });
        break;
      }
    }
    if (j < 0) {
      push({ type: 'stop', title: 'Reached the start', lines: [5], marks: { [0]: 'hole' }, ranges: portion(i - 1), hold,
        text: `There is nothing left to the left of index 0, so the key ${key} becomes the smallest value so far.` });
    }
    a[j + 1] = key;
    counts.writes += 1;
    push({ type: 'insert', title: 'Insert the key', lines: [9], marks: { [j + 1]: 'write' }, ranges: portion(i),
      text: `Write the key ${key} into index ${j + 1}. Indices 0 to ${i} are now sorted relative to each other.` });
  }

  sorted.fill(true);
  setVars({ n, i: null, j: null, key: null });
  push({ type: 'done', title: 'Sorted', lines: [10, 11],
    text: n <= 1 ? 'A single element is already sorted.' : `The array is sorted after ${plural(counts.comparisons, 'comparison')} and ${plural(counts.writes, 'write')}.` });
  return steps;
}

export const insertionSort = {
  topicId: 'sort-insertion', slug: 'insertion', name: 'Insertion Sort', difficulty: 'Beginner',
  summary: 'Builds a sorted section one element at a time by sliding each new element left until it fits.',
  generateSteps: insertionSortSteps, java: JAVA,
  counters: ['comparisons', 'writes'], legend: ['key', 'write'],
  counterDefs: [
    ['Comparisons', 'each check of arr[j] > key while looking for the key\'s position.'],
    ['Writes', 'each assignment into the array: one per shifted element plus one to drop the key. Insertion Sort shifts instead of swapping, so swaps are not counted.'],
  ],
};
