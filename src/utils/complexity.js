// Keyed by topic id (see data/catalog.js).
export const COMPLEXITY = {
  'sort-bubble': {
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    stable: true,
    notes: [
      'Best case O(n): on an already sorted array the first pass makes n − 1 comparisons and no swaps, so the early-exit check stops the algorithm after that single pass.',
      'Worst case O(n²): a reverse-sorted array needs n(n − 1)/2 comparisons and the same number of swaps. The average case on random data is also quadratic.',
      'Auxiliary space O(1): the array is sorted in place and only a few variables (i, j, temp, swapped) are needed.',
      'Stable: equal elements are never swapped, so their original order is kept.',
    ],
  },
};

COMPLEXITY['sort-selection'] = {
  time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  space: 'O(1)',
  stable: false,
  notes: [
    'Always O(n²): finding the minimum scans the whole unsorted part, even if the array is already sorted, so it makes exactly n(n − 1)/2 comparisons.',
    'It performs at most n − 1 swaps, fewer than Bubble or Insertion Sort. That helps when writes are expensive.',
    'Auxiliary space O(1): the sort is in place and uses only a few indices and one temporary variable.',
    'Not stable in its usual form: swapping the minimum into place can jump an element over equal values.',
  ],
};
COMPLEXITY['sort-insertion'] = {
  time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  space: 'O(1)',
  stable: true,
  notes: [
    'Best case O(n): on an already sorted array every key stops after one comparison, giving n − 1 comparisons and no shifts.',
    'Worst case O(n²): on a reverse-sorted array every key shifts all the way to the front, giving n(n − 1)/2 comparisons and shifts.',
    'Auxiliary space O(1): only the key and a couple of indices are stored.',
    'Stable: elements are shifted only while they are strictly larger than the key.',
  ],
};
COMPLEXITY['sort-merge'] = {
  time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  space: 'O(n)',
  stable: true,
  notes: [
    'Splitting halves the range each time, so there are about log₂ n levels, and merging one level touches all n elements. That gives O(n log n) in every case.',
    'Auxiliary space O(n): merging copies the halves into buffers (the recursion adds only O(log n) on top).',
    'Stable: when two values are equal the one from the left half is written first.',
  ],
};
COMPLEXITY['sort-quick'] = {
  time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
  space: 'O(log n)',
  stable: false,
  notes: [
    'Best and average case O(n log n): each partition does O(n) work and a reasonably balanced split gives about log n levels.',
    'Worst case O(n²): when the pivot is always the smallest or largest value, the split is 1 versus n − 1. With the last element as pivot, an already sorted or reverse-sorted array does exactly that.',
    'Auxiliary space O(log n) for the recursion stack on balanced splits (it can reach O(n) in the worst case). The partitioning itself is in place.',
    'Not stable: swaps can move equal values past each other.',
  ],
};
COMPLEXITY['sort-heap'] = {
  time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  space: 'O(1)',
  stable: false,
  notes: [
    'Building the heap costs O(n). Each of the n − 1 extractions sifts down through at most log₂ n levels, so the total is O(n log n) in every case.',
    'Auxiliary space O(1): the heap lives inside the array being sorted.',
    'Not stable: moving the maximum to the end and sifting down reorders equal values.',
  ],
};

COMPLEXITY['search-linear'] = {
  time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  space: 'O(1)',
  notes: [
    'Best case O(1): the target is the first element, so one comparison is enough.',
    'Average and worst case O(n): the target is somewhere in the array or missing, and in the worst case every element is checked once.',
    'Auxiliary space O(1): only an index is kept. It needs no sorting, which is its advantage over binary search.',
  ],
};
COMPLEXITY['search-binary'] = {
  time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  space: 'O(1)',
  notes: [
    'Best case O(1): the target happens to be the first middle element.',
    'Average and worst case O(log n): every comparison discards about half of the remaining indices, so at most about log₂ n + 1 comparisons are needed (about 20 for a million elements).',
    'Auxiliary space O(1) for the iterative version shown. The array must already be sorted, and sorting it first costs O(n log n).',
    'With duplicate values it returns one index holding the target, not necessarily the first.',
  ],
};

const TREE_NOTE = 'Every node is visited exactly once and each visit does a constant amount of work, so the time is O(n) for any tree shape.';
const dfs = (name) => ({
  time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  space: 'O(h)',
  notes: [TREE_NOTE, `Auxiliary space O(h), where h is the height of the tree: ${name} keeps one call on the call stack per level. That is O(log n) for a balanced tree and O(n) for a tree that is a single chain.`],
});
COMPLEXITY['tree-preorder'] = dfs('preorder');
COMPLEXITY['tree-inorder'] = dfs('inorder');
COMPLEXITY['tree-postorder'] = dfs('postorder');
COMPLEXITY['tree-levelorder'] = {
  time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  space: 'O(w)',
  notes: [TREE_NOTE, 'Auxiliary space O(w), where w is the maximum width of the tree: the queue holds at most one full level. That is up to about n / 2 nodes for a complete tree.'],
};
