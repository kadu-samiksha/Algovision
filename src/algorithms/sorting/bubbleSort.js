/**
 * Bubble Sort, recorded as a list of immutable step snapshots.
 *
 * Counting conventions (shown in the UI):
 *  - comparisons: times arr[j] was compared with arr[j + 1] (one per inner-loop iteration)
 *  - swaps: times two neighbouring elements were exchanged
 *
 * Every step carries `lines`, the Java lines (see JAVA below) it corresponds to.
 * The mapping is fixed metadata written next to the step, never inferred.
 */

export const JAVA = {
  lines: [
    'static void bubbleSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 0; i < n - 1; i++) {',
    '        boolean swapped = false;',
    '        for (int j = 0; j < n - i - 1; j++) {',
    '            if (arr[j] > arr[j + 1]) {',
    '                int temp = arr[j];',
    '                arr[j] = arr[j + 1];',
    '                arr[j + 1] = temp;',
    '                swapped = true;',
    '            }',
    '        }',
    '        if (!swapped) break;',
    '    }',
    '}',
  ],
  // Explanation shown for the first (primary) highlighted line of a step.
  notes: {
    2: 'Store the array length so the loops know where to stop.',
    3: 'The outer loop runs one pass per iteration. Each pass places one more element at the end.',
    5: 'The inner loop walks over neighbouring pairs, skipping the elements already placed at the end.',
    6: 'This condition is false: the pair is already in order, so the body is skipped.',
    7: 'Three assignments (lines 7 to 9) swap the pair through temp. Line 10 records that a swap happened.',
    12: 'The inner loop has finished. The largest unsorted value is now in place. Line 13 checks whether any swap happened.',
    13: 'No swap happened during the pass, so the array is sorted and the loop breaks early.',
    14: 'All passes are done, so the array has been sorted in place.',
  },
};

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function bubbleSortSteps(input) {
  const a = [...input];
  const n = a.length;
  const sorted = new Array(n).fill(false);
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  let vars = { n, i: null, j: null, swapped: null };

  const push = (step) =>
    steps.push({
      array: [...a],
      sorted: [...sorted],
      compare: null,
      swapped: null,
      region: null,
      ...step,
      line: step.lines[0],
      vars: { ...vars },
      comparisons,
      swaps,
      writes: 0,
    });

  push({
    type: 'start',
    title: 'Ready',
    lines: [2],
    text:
      n <= 1
        ? `The array has ${plural(n, 'element')}, so there is nothing to compare.`
        : `Bubble Sort makes up to ${n - 1} passes. Each pass compares neighbouring elements and pushes the largest unsorted value to the end of the unsorted region.`,
  });

  let stoppedEarly = false;
  for (let i = 0; i < n - 1 && !stoppedEarly; i++) {
    const end = n - i - 1;
    let swappedInPass = false;
    vars = { n, i, j: null, swapped: false };
    push({
      type: 'pass',
      title: `Pass ${i + 1}`,
      lines: [3, 4],
      region: [0, end],
      text: `Pass ${i + 1}: compare neighbours in indices 0 to ${end}. The largest value in that range will settle at index ${end}.`,
    });

    for (let j = 0; j < end; j++) {
      vars = { n, i, j, swapped: swappedInPass };
      comparisons += 1;
      push({
        type: 'compare',
        title: 'Compare',
        lines: [5, 6],
        compare: [j, j + 1],
        region: [0, end],
        text: `Comparing the elements at indices ${j} and ${j + 1}: ${a[j]} and ${a[j + 1]}.`,
      });

      if (a[j] > a[j + 1]) {
        const left = a[j];
        const right = a[j + 1];
        a[j] = right;
        a[j + 1] = left;
        swaps += 1;
        swappedInPass = true;
        vars = { n, i, j, swapped: true };
        push({
          type: 'swap',
          title: 'Swap',
          lines: [7, 8, 9, 10],
          compare: [j, j + 1],
          swapped: [j, j + 1],
          region: [0, end],
          text: `${left} is larger than ${right}, so Bubble Sort swaps the two elements. The larger value moves one place to the right.`,
        });
      } else {
        push({
          type: 'in-order',
          title: 'Already in order',
          lines: [6],
          compare: [j, j + 1],
          region: [0, end],
          text:
            a[j] === a[j + 1]
              ? `${a[j]} equals ${a[j + 1]}, so the pair is in order and nothing moves. Equal values are never swapped, which keeps Bubble Sort stable.`
              : `${a[j]} is not larger than ${a[j + 1]}, so the pair is already in order and nothing moves.`,
        });
      }
    }

    sorted[end] = true;
    vars = { n, i, j: null, swapped: swappedInPass };
    if (swappedInPass) {
      push({
        type: 'pass-end',
        title: 'Pass complete',
        lines: [12, 13],
        text: `End of pass ${i + 1}: ${a[end]} is now in its final position at index ${end}.`,
      });
    } else {
      sorted.fill(true);
      stoppedEarly = true;
      push({
        type: 'early-exit',
        title: 'Stopped early',
        lines: [13],
        text: `Pass ${i + 1} made no swaps, so every pair is in order. The array is already sorted and Bubble Sort stops early.`,
      });
    }
  }

  sorted.fill(true);
  vars = { n, i: null, j: null, swapped: null };
  push({
    type: 'done',
    title: 'Sorted',
    lines: [14, 15],
    text:
      n <= 1
        ? 'A single element is already sorted.'
        : `The array is sorted after ${plural(comparisons, 'comparison')} and ${plural(swaps, 'swap')}.`,
  });

  return steps;
}

export const bubbleSort = {
  topicId: 'sort-bubble',
  slug: 'bubble',
  name: 'Bubble Sort',
  difficulty: 'Beginner',
  summary:
    'Repeatedly compares neighbouring elements and swaps them when they are out of order, so the largest values "bubble" to the end of the array.',
  generateSteps: bubbleSortSteps,
  java: JAVA,
  counters: ['comparisons', 'swaps'],
  legend: [],
  counterDefs: [
    ['Comparisons', 'each check of arr[j] > arr[j + 1].'],
    ['Swaps', 'each exchange of two neighbours. One swap is three array writes through temp, and writes are not counted separately.'],
  ],
};
