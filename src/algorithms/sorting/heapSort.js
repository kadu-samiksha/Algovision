import { createRecorder, plural } from './recorder.js';

export const JAVA = {
  lines: [
    'static void heapSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = n / 2 - 1; i >= 0; i--)',
    '        heapify(arr, n, i);',
    '    for (int end = n - 1; end > 0; end--) {',
    '        swap(arr, 0, end);',
    '        heapify(arr, end, 0);',
    '    }',
    '}',
    '',
    'static void heapify(int[] arr, int size, int root) {',
    '    int largest = root;',
    '    int left = 2 * root + 1, right = 2 * root + 2;',
    '    if (left < size && arr[left] > arr[largest]) largest = left;',
    '    if (right < size && arr[right] > arr[largest]) largest = right;',
    '    if (largest != root) {',
    '        swap(arr, root, largest);',
    '        heapify(arr, size, largest);',
    '    }',
    '}',
  ],
  notes: {
    2: 'Store the array length. The array is treated as a binary tree: the children of index r are 2r + 1 and 2r + 2.',
    3: 'Build a max-heap: sift down every parent, starting from the last one and moving to the root.',
    5: 'The array is now a max-heap, so the largest value is at index 0.',
    6: 'Swap the largest value (index 0) with the last heap element. That value is now final, and the heap shrinks by one.',
    8: 'The heap is empty, so every value is in its final position.',
    11: 'heapify sifts the value at root down until neither child is larger.',
    14: 'Check the right child against the largest value found so far.',
    13: 'Check the left child against the root: whichever is larger becomes the candidate.',
    15: 'If a child was larger, swap it with the root (line 16) and keep sifting down (line 17). Otherwise the root has settled.',
  },
};

export function heapSortSteps(input) {
  const { a, n, sorted, counts, steps, push, setVars } = createRecorder(input);
  const vars = (o) => setVars({ n, size: null, root: null, largest: null, ...o });
  vars({});
  push({
    type: 'start', title: 'Ready', lines: [2],
    text: n <= 1
      ? `The array has ${plural(n, 'element')}, so there is nothing to sort.`
      : 'Heap Sort first arranges the array into a max-heap, then repeatedly moves the largest value to the end and repairs the heap.',
  });
  const heap = (size) => [{ from: 0, to: size - 1, label: `Active heap, indices 0 to ${size - 1}`, tone: 'blue' }];

  function heapify(size, start) {
    let root = start;
    for (;;) {
      let largest = root;
      const left = 2 * root + 1;
      const right = 2 * root + 2;
      vars({ size, root, largest });
      push({ type: 'heapify', title: 'Sift down', lines: [11, 12], marks: { [root]: 'root' }, ranges: heap(size),
        text: `Sift down from index ${root} (value ${a[root]}). ${left < size ? `Its children are at indices ${left}${right < size ? ` and ${right}` : ''}.` : 'It has no children inside the heap.'}` });
      for (const [child, side, line] of [[left, 'left', 13], [right, 'right', 14]]) {
        if (child >= size) continue;
        counts.comparisons += 1;
        push({ type: 'compare', title: 'Compare', lines: [line], compare: [child, largest], marks: { [root]: 'root' }, ranges: heap(size),
          text: `Comparing the ${side} child ${a[child]} (index ${child}) with the largest so far ${a[largest]} (index ${largest}).` });
        if (a[child] > a[largest]) {
          largest = child;
          vars({ size, root, largest });
          push({ type: 'new-largest', title: 'New largest', lines: [line], marks: { [root]: 'root', [largest]: 'pivot' }, ranges: heap(size),
            text: `The ${side} child is larger, so index ${largest} becomes the largest candidate.` });
        } else {
          push({ type: 'keep-largest', title: 'Largest unchanged', lines: [line], marks: { [root]: 'root' }, ranges: heap(size),
            text: `The ${side} child is not larger than ${a[largest]}, so the candidate stays at index ${largest}.` });
        }
      }
      if (largest !== root) {
        const x = a[root];
        const y = a[largest];
        a[root] = y;
        a[largest] = x;
        counts.swaps += 1;
        push({ type: 'swap', title: 'Swap', lines: [15, 16, 17], swapped: [root, largest], ranges: heap(size),
          text: `${y} is larger than ${x}, so swap indices ${root} and ${largest}, then keep sifting ${x} down from index ${largest}.` });
        root = largest;
      } else {
        push({ type: 'settled', title: 'Settled', lines: [15], marks: { [root]: 'root' }, ranges: heap(size),
          text: `${a[root]} is at least as large as its children, so it sits in a valid heap position.` });
        return;
      }
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    vars({ size: n, root: i });
    push({ type: 'build', title: 'Build the heap', lines: [3, 4], marks: { [i]: 'root' }, ranges: heap(n),
      text: `Build the max-heap: sift down index ${i}, the next parent from the bottom.` });
    heapify(n, i);
  }
  if (n > 1) {
    vars({ size: n });
    push({ type: 'heap-built', title: 'Heap built', lines: [5], ranges: heap(n),
      text: `The array is now a max-heap. The largest value, ${a[0]}, is at index 0.` });
  }
  for (let end = n - 1; end > 0; end--) {
    const x = a[0];
    const y = a[end];
    a[0] = y;
    a[end] = x;
    counts.swaps += 1;
    sorted[end] = true;
    vars({ size: end });
    push({ type: 'swap', title: 'Extract the maximum', lines: [6], swapped: [0, end], ranges: heap(end),
      text: `Swap the maximum ${x} to index ${end}. It is now final, and the heap shrinks to indices 0 to ${end - 1}.` });
    heapify(end, 0);
  }

  sorted.fill(true);
  vars({});
  push({ type: 'done', title: 'Sorted', lines: [8, 9],
    text: n <= 1 ? 'A single element is already sorted.' : `The array is sorted after ${plural(counts.comparisons, 'comparison')} and ${plural(counts.swaps, 'swap')}.` });
  return steps;
}

export const heapSort = {
  topicId: 'sort-heap', slug: 'heap', name: 'Heap Sort', difficulty: 'Advanced',
  summary: 'Turns the array into a max-heap, then repeatedly moves the largest value to the end and repairs the heap.',
  generateSteps: heapSortSteps, java: JAVA,
  counters: ['comparisons', 'swaps'], legend: ['root', 'pivot'],
  counterDefs: [
    ['Comparisons', 'each check of a child against the largest value so far (arr[child] > arr[largest]). Children outside the heap are not compared.'],
    ['Swaps', 'each exchange of two positions, both while sifting down and when moving the maximum to the end.'],
  ],
};
