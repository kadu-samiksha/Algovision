import { bubbleSort } from './bubbleSort.js';
import { selectionSort } from './selectionSort.js';
import { insertionSort } from './insertionSort.js';
import { mergeSort } from './mergeSort.js';
import { quickSort } from './quickSort.js';
import { heapSort } from './heapSort.js';

export const SORTING_ALGORITHMS = Object.fromEntries(
  [bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort].map((e) => [e.slug, e]),
);
