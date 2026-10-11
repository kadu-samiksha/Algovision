const base = (array) => ({ array: [...array] });

function make(array) {
  const n = array.length;
  const eliminated = new Array(n).fill(false);
  const steps = [];
  let comparisons = 0;
  let vars = {};
  const push = (s) =>
    steps.push({ ...base(array), current: null, left: null, right: null, mid: null, found: null, result: null,
      ...s, line: s.lines[0], eliminated: [...eliminated], vars: { ...vars }, comparisons });
  return { n, eliminated, steps, push, count: () => { comparisons += 1; }, setVars: (v) => { vars = v; } };
}

/* ---------------- Linear search ---------------- */
export const LINEAR_JAVA = {
  lines: [
    'static int linearSearch(int[] arr, int target) {',
    '    for (int i = 0; i < arr.length; i++) {',
    '        if (arr[i] == target) {',
    '            return i;',
    '        }',
    '    }',
    '    return -1;',
    '}',
  ],
  notes: {
    1: 'Linear search takes the array and the target value, and returns the index of the first match or -1.',
    2: 'Visit the indices from left to right, one at a time.',
    3: 'Compare the current element with the target.',
    4: 'A match was found, so the method returns this index straight away.',
    7: 'Every element was checked and none matched, so the target is not in the array.',
  },
};

export function linearSearchSteps(array, target) {
  const { n, eliminated, steps, push, count, setVars } = make(array);
  setVars({ i: null });
  push({ type: 'start', title: 'Ready', lines: [1],
    text: n === 0 ? `The array is empty, so ${target} cannot be in it.` : `Linear search checks each element from left to right until it finds ${target} or runs out of elements.` });
  for (let i = 0; i < n; i++) {
    count();
    setVars({ i });
    push({ type: 'compare', title: 'Compare', lines: [2, 3], current: i, text: `Checking index ${i}: is ${array[i]} equal to the target ${target}?` });
    if (array[i] === target) {
      push({ type: 'found', title: 'Found', lines: [4], current: i, found: i, result: 'found',
        text: `${array[i]} equals ${target}. The target is at index ${i}, so the search stops here.` });
      return steps;
    }
    eliminated[i] = true;
    push({ type: 'no-match', title: 'No match', lines: [3], current: i,
      text: `${array[i]} is not ${target}, so index ${i} is ruled out. Move on to index ${i + 1}.` });
  }
  setVars({ i: null });
  push({ type: 'not-found', title: 'Not found', lines: [7], result: 'not-found',
    text: n === 0 ? `The array is empty, so ${target} was not found.` : `All ${n} elements were checked and none equals ${target}. The search is unsuccessful.` });
  return steps;
}

/* ---------------- Binary search ---------------- */
export const BINARY_JAVA = {
  lines: [
    'static int binarySearch(int[] arr, int target) {',
    '    int left = 0, right = arr.length - 1;',
    '    while (left <= right) {',
    '        int mid = left + (right - left) / 2;',
    '        if (arr[mid] == target) return mid;',
    '        if (arr[mid] < target) left = mid + 1;',
    '        else right = mid - 1;',
    '    }',
    '    return -1;',
    '}',
  ],
  notes: {
    1: 'Binary search needs a sorted array. It returns an index holding the target, or -1.',
    2: 'The search space starts as the whole array: indices left to right.',
    3: 'The loop continues while the search space still contains at least one index.',
    4: 'Look at the middle of the search space. One comparison will rule out about half of it.',
    5: 'If the middle value equals the target, the search is over.',
    6: 'The middle value is too small, so the target (if present) must be to the right. Discard the left half.',
    7: 'The middle value is too large, so the target (if present) must be to the left. Discard the right half.',
    9: 'The search space is empty, so the target is not in the array.',
  },
};

export function binarySearchSteps(array, target) {
  const { n, eliminated, steps, push, count, setVars } = make(array);
  let left = 0;
  let right = n - 1;
  setVars({ left, right, mid: null });
  push({ type: 'start', title: 'Ready', lines: [1, 2], left, right,
    text: n === 0 ? `The array is empty, so ${target} cannot be in it.` : `Binary search keeps a search space (left to right) and halves it each step. It starts as the whole array, indices 0 to ${n - 1}.` });
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    setVars({ left, right, mid });
    push({ type: 'mid', title: 'Pick the middle', lines: [3, 4], left, right, mid, current: mid,
      text: `The search space is indices ${left} to ${right}. The middle index is ${mid}, holding ${array[mid]}.` });
    count();
    push({ type: 'compare', title: 'Compare', lines: [5], left, right, mid, current: mid,
      text: `Comparing the middle value ${array[mid]} with the target ${target}.` });
    if (array[mid] === target) {
      push({ type: 'found', title: 'Found', lines: [5], left, right, mid, current: mid, found: mid, result: 'found',
        text: `${array[mid]} equals ${target}, so the target is at index ${mid}.` });
      return steps;
    }
    if (array[mid] < target) {
      for (let i = left; i <= mid; i++) eliminated[i] = true;
      const oldLeft = left;
      left = mid + 1;
      setVars({ left, right, mid });
      push({ type: 'eliminate-left', title: 'Discard the left part', lines: [6], left, right, mid, current: mid,
        text: `${array[mid]} is less than ${target}. The array is sorted, so every value at indices ${oldLeft} to ${mid} is at most ${array[mid]} and cannot be the target. Discard them and search indices ${left} to ${right}.` });
    } else {
      for (let i = mid; i <= right; i++) eliminated[i] = true;
      const oldRight = right;
      right = mid - 1;
      setVars({ left, right, mid });
      push({ type: 'eliminate-right', title: 'Discard the right part', lines: [7], left, right, mid, current: mid,
        text: `${array[mid]} is greater than ${target}. The array is sorted, so every value at indices ${mid} to ${oldRight} is at least ${array[mid]} and cannot be the target. Discard them and search indices ${left} to ${right}.` });
    }
  }
  setVars({ left, right, mid: null });
  push({ type: 'not-found', title: 'Not found', lines: [9], left, right, result: 'not-found',
    text: n === 0 ? `The array is empty, so ${target} was not found.` : `The search space is empty (left is greater than right), so ${target} is not in the array. The search is unsuccessful.` });
  return steps;
}

export function isSortedAscending(array) {
  return array.every((v, i) => i === 0 || array[i - 1] <= v);
}

export const linearSearch = {
  topicId: 'search-linear', slug: 'linear', name: 'Linear Search', difficulty: 'Beginner',
  summary: 'Checks every element in order until it finds the target or reaches the end. It works on any array, sorted or not.',
  generateSteps: linearSearchSteps, java: LINEAR_JAVA, needsSorted: false,
  validate: () => null,
  counterDefs: [['Comparisons', 'each check of arr[i] == target.']],
};
export const binarySearch = {
  topicId: 'search-binary', slug: 'binary', name: 'Binary Search', difficulty: 'Beginner',
  summary: 'Repeatedly compares the target with the middle of a sorted array and discards the half that cannot contain it.',
  generateSteps: binarySearchSteps, java: BINARY_JAVA, needsSorted: true,
  validate: (array) => (isSortedAscending(array) ? null : 'Binary search only works on a sorted array, and this array is not sorted. Sort it first (nothing is sorted for you silently), or switch to Linear Search.'),
  counterDefs: [['Comparisons', 'each check of arr[mid] == target. The follow-up less-than test is part of the same decision and is not counted again.']],
};
export const SEARCH_ALGORITHMS = { linear: linearSearch, binary: binarySearch };
