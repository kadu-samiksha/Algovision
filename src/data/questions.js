import { queueNew, queueOps, stackNew, stackOps } from '../algorithms/stackQueue/structures.js';
import { insertAt } from '../algorithms/linkedList/operations.js';
import { TRAVERSALS, parseLevelOrder, traversalOutput } from '../algorithms/trees/tree.js';

export const PRACTICE_TOPICS = [
  { id: 'sorting', label: 'Sorting' },
  { id: 'searching', label: 'Searching' },
  { id: 'linked-lists', label: 'Linked Lists' },
  { id: 'stack-queue', label: 'Stacks and Queues' },
  { id: 'trees', label: 'Binary Trees' },
];
export const QUESTION_TYPES = { mcq: 'Multiple choice', 'next-op': 'Predict the next operation', traversal: 'Predict the traversal', complexity: 'Identify the complexity' };

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** The correct option's position is fixed by the question id, so the bank is fully deterministic. */
function q({ id, topic, type, prompt, answer, wrong, explanation }) {
  const options = [...wrong];
  const correct = hash(id) % (options.length + 1);
  options.splice(correct, 0, answer);
  return { id, topic, type, prompt, options, correct, explanation };
}

const list = (nodes) => (nodes.length ? nodes.map((n) => n.value).join(' → ') : 'empty');
const mk = (...values) => values.map((value, i) => ({ id: i + 1, value }));
const seq = (arr) => arr.join(', ');

/* ---- computed answers (derived from the real implementations, so they cannot drift) ---- */
const stackFinal = (() => {
  let s = stackNew();
  s = stackOps.push(s, 4).state; s = stackOps.push(s, 9).state; s = stackOps.pop(s).state; s = stackOps.push(s, 2).state;
  return seq(s.items);
})();
const queueFinal = (() => {
  let s = queueNew();
  s = queueOps.enqueue(s, 5).state; s = queueOps.enqueue(s, 8).state; s = queueOps.dequeue(s).state; s = queueOps.enqueue(s, 1).state;
  return seq(s.items);
})();
const stackPop = stackOps.pop({ items: [2, 5, 9] }).value;
const llInsert = list(insertAt(mk(3, 5, 8), 2, 7, 99).nodes);

function traversalQuestion(id, text, kind) {
  const t = parseLevelOrder(text);
  const answer = seq(traversalOutput(t.nodes, t.root, kind));
  const wrong = [];
  for (const other of Object.keys(TRAVERSALS)) {
    const out = seq(traversalOutput(t.nodes, t.root, other));
    if (other !== kind && out !== answer && !wrong.includes(out)) wrong.push(out);
  }
  const base = traversalOutput(t.nodes, t.root, kind);
  for (let r = 1; wrong.length < 3 && r < base.length; r++) {
    const out = seq([...base.slice(r), ...base.slice(0, r)]);
    if (out !== answer && !wrong.includes(out)) wrong.push(out);
  }
  const tr = TRAVERSALS[kind];
  return { ...q({
    id, topic: 'trees', type: 'traversal',
    prompt: `A binary tree is given in level-order as: ${text.replace(/\bnull\b/g, 'null')}. What is its ${tr.short.toLowerCase()} traversal?`,
    answer, wrong: wrong.slice(0, 3),
    explanation: `${tr.short} visits: ${tr.rule.toLowerCase()}. Applying that rule to this tree gives ${answer}.`,
  }), tree: text };
}

export const QUESTIONS = [
  q({ id: 'sort-1', topic: 'sorting', type: 'complexity', prompt: 'What is the worst-case time complexity of Bubble Sort?', answer: 'O(n²)', wrong: ['O(n)', 'O(n log n)', 'O(log n)'],
    explanation: 'On a reverse-sorted array every pass swaps nearly every pair, so it makes n(n − 1)/2 comparisons: quadratic.' }),
  q({ id: 'sort-2', topic: 'sorting', type: 'complexity', prompt: 'Bubble Sort with an early-exit check runs on an array that is already sorted. What is its time complexity?', answer: 'O(n)', wrong: ['O(n²)', 'O(n log n)', 'O(1)'],
    explanation: 'The first pass makes n − 1 comparisons and no swaps, so the early-exit check stops the sort after that single pass.' }),
  q({ id: 'sort-3', topic: 'sorting', type: 'mcq', prompt: 'Which of these standard sorting algorithms is stable?', answer: 'Merge Sort', wrong: ['Quick Sort', 'Heap Sort', 'Selection Sort'],
    explanation: 'Merge Sort writes the left value first when two values are equal, so equal values keep their order. Quick, Heap and Selection Sort can move equal values past each other.' }),
  q({ id: 'sort-4', topic: 'sorting', type: 'complexity', prompt: 'How much auxiliary space does Merge Sort need?', answer: 'O(n)', wrong: ['O(1)', 'O(log n)', 'O(n²)'],
    explanation: 'Merging copies the two halves into buffers, which together hold up to n values.' }),
  q({ id: 'sort-5', topic: 'sorting', type: 'mcq', prompt: 'Quick Sort uses the last element as its pivot. On which input does it hit its O(n²) worst case?', answer: 'An array that is already sorted', wrong: ['A randomly shuffled array', 'An array with exactly two elements', 'Never: it is always O(n log n)'],
    explanation: 'On sorted input the last element is the largest, so every partition splits the range into n − 1 elements and nothing, giving n levels of work.' }),
  q({ id: 'sort-6', topic: 'sorting', type: 'next-op', prompt: 'Bubble Sort is running on [5, 1, 4] and has just compared 5 and 1. What does it do next?', answer: 'Swaps them, giving [1, 5, 4]', wrong: ['Leaves them alone, keeping [5, 1, 4]', 'Swaps 1 and 4, giving [5, 4, 1]', 'Moves 5 straight to the end, giving [1, 4, 5]'],
    explanation: '5 is larger than 1, so the neighbouring pair is out of order and is swapped. Bubble Sort only ever exchanges neighbours, so 5 moves just one place.' }),
  q({ id: 'sort-7', topic: 'sorting', type: 'mcq', prompt: 'At most how many swaps does Selection Sort make on n elements?', answer: 'n − 1', wrong: ['n(n − 1)/2', 'n log n', 'n²'],
    explanation: 'Each pass makes at most one swap (placing the minimum), and there are n − 1 passes.' }),
  q({ id: 'sort-8', topic: 'sorting', type: 'mcq', prompt: 'How many comparisons does Insertion Sort make on an already sorted array of n elements?', answer: 'n − 1', wrong: ['n(n − 1)/2', 'n log n', '1'],
    explanation: 'Each key is compared once with its left neighbour, finds that neighbour is not larger, and stops. That is one comparison for each of the n − 1 keys.' }),
  q({ id: 'sort-9', topic: 'sorting', type: 'mcq', prompt: 'What structure does Heap Sort build inside the array?', answer: 'A max-heap', wrong: ['A binary search tree', 'A sorted linked list', 'A hash table'],
    explanation: 'The array is treated as a binary tree where each parent is at least as large as its children, so the maximum sits at index 0 and can be moved to the end.' }),
  q({ id: 'sort-10', topic: 'sorting', type: 'mcq', prompt: 'After one Quick Sort partition step, where is the pivot?', answer: 'In its final sorted position', wrong: ['Always at the start of the range', 'Always back at the end of the range', 'Somewhere in the left group'],
    explanation: 'Everything to its left is smaller and everything to its right is greater or equal, so the pivot is exactly where it will be in the sorted array.' }),
  q({ id: 'sort-11', topic: 'sorting', type: 'mcq', prompt: 'Which strategy does Merge Sort use?', answer: 'Divide and conquer', wrong: ['Greedy choice', 'Dynamic programming', 'Repeated neighbour swapping'],
    explanation: 'It splits the problem in half, solves each half recursively, and combines the sorted halves by merging.' }),
  q({ id: 'sort-12', topic: 'sorting', type: 'complexity', prompt: 'What is the worst-case time complexity of Heap Sort?', answer: 'O(n log n)', wrong: ['O(n)', 'O(n²)', 'O(log n)'],
    explanation: 'Building the heap is O(n), and each of the n − 1 extractions sifts down through at most log n levels.' }),
  q({ id: 'sort-13', topic: 'sorting', type: 'next-op', prompt: 'Insertion Sort is inserting the key 3 into the sorted portion [1, 4, 6]. Which values shift one slot to the right?', answer: '4 and 6', wrong: ['Only 6', '1, 4 and 6', 'Nothing shifts'],
    explanation: 'Moving left from 6: 6 > 3 shifts, 4 > 3 shifts, and 1 is not larger than 3, so the key is dropped right after 1.' }),

  q({ id: 'search-1', topic: 'searching', type: 'mcq', prompt: 'What must be true before binary search can be used?', answer: 'The array is sorted', wrong: ['The array has no duplicates', 'The array length is a power of two', 'All values are positive'],
    explanation: 'Discarding half the array is only valid because the order tells us which side the target must be on.' }),
  q({ id: 'search-2', topic: 'searching', type: 'complexity', prompt: 'What is the worst-case time complexity of binary search?', answer: 'O(log n)', wrong: ['O(n)', 'O(1)', 'O(n log n)'],
    explanation: 'Each comparison halves the remaining search space, so at most about log₂ n + 1 comparisons are needed.' }),
  q({ id: 'search-3', topic: 'searching', type: 'next-op', prompt: 'Binary search looks for 23 in [2, 5, 8, 12, 16, 23, 38]. Which value is compared first?', answer: '12', wrong: ['23', '2', '16'],
    explanation: 'The search space is indices 0 to 6, so the middle index is 3, which holds 12. Since 12 < 23, the left part is discarded.' }),
  q({ id: 'search-4', topic: 'searching', type: 'mcq', prompt: 'Linear search for 9 in [3, 9, 4, 9] returns which index?', answer: '1', wrong: ['3', '0', '-1'],
    explanation: 'Linear search checks from the left and stops at the first match, which is index 1.' }),
  q({ id: 'search-5', topic: 'searching', type: 'complexity', prompt: 'What is the worst-case time complexity of linear search?', answer: 'O(n)', wrong: ['O(log n)', 'O(1)', 'O(n²)'],
    explanation: 'If the target is last or missing, every one of the n elements is checked once.' }),
  q({ id: 'search-6', topic: 'searching', type: 'mcq', prompt: 'About how many comparisons does binary search need at most for 1,000,000 sorted elements?', answer: 'About 20', wrong: ['About 1,000', 'About 500,000', 'About 6'],
    explanation: 'log₂(1,000,000) is just under 20, and each comparison halves the search space.' }),
  q({ id: 'search-7', topic: 'searching', type: 'next-op', prompt: 'In binary search the middle value is smaller than the target. What happens next?', answer: 'The left part, including the middle, is discarded', wrong: ['The right part is discarded', 'The search restarts from index 0', 'The middle index is returned'],
    explanation: 'The array is sorted, so everything at or left of the middle is at most the middle value, which is already too small.' }),

  q({ id: 'll-1', topic: 'linked-lists', type: 'complexity', prompt: 'What is the time complexity of inserting at the head of a singly linked list?', answer: 'O(1)', wrong: ['O(n)', 'O(log n)', 'O(n²)'],
    explanation: 'Only two pointer assignments are needed, whatever the length of the list.' }),
  q({ id: 'll-2', topic: 'linked-lists', type: 'complexity', prompt: 'What is the time complexity of inserting at the tail when you only keep a head pointer?', answer: 'O(n)', wrong: ['O(1)', 'O(log n)', 'O(n²)'],
    explanation: 'You must walk from the head to the last node before you can link the new node.' }),
  q({ id: 'll-3', topic: 'linked-lists', type: 'next-op', prompt: 'The list is 3 → 5 → 8. What does it look like after insertAt(2, 7)?', answer: llInsert, wrong: ['3 → 7 → 5 → 8', '7 → 3 → 5 → 8', '3 → 5 → 8 → 7'],
    explanation: 'Positions start at 0, so the new node ends up at index 2: after 3 and 5, before 8.' }),
  q({ id: 'll-4', topic: 'linked-lists', type: 'mcq', prompt: 'When inserting in the middle, why is node.next = prev.next done before prev.next = node?', answer: 'Otherwise the rest of the list would become unreachable', wrong: ['Java requires it', 'It makes the insertion O(1)', 'So that prev is never null'],
    explanation: 'If prev.next were changed first, nothing would still point at the node that used to follow prev, and the tail of the list would be lost.' }),
  q({ id: 'll-5', topic: 'linked-lists', type: 'next-op', prompt: 'The list is 4 → 6 → 9. What is the list after head = head.next?', answer: '6 → 9', wrong: ['4 → 9', '4 → 6', '9'],
    explanation: 'Moving head to the second node leaves the first node unreachable, so it is effectively removed.' }),
  q({ id: 'll-6', topic: 'linked-lists', type: 'mcq', prompt: 'To delete a node (not the head) from a singly linked list, which node do you need to reach?', answer: 'The node just before it', wrong: ['The tail', 'The node just after it', 'Only the head'],
    explanation: 'Nodes only point forward, so the previous node is the one whose next pointer must be changed to skip the target.' }),
  q({ id: 'll-7', topic: 'linked-lists', type: 'mcq', prompt: 'What does the last node of a singly linked list store in its next pointer?', answer: 'null', wrong: ['A pointer to the head', 'A pointer to itself', 'The size of the list'],
    explanation: 'null marks the end of the list. Traversals stop when cur becomes null.' }),

  q({ id: 'sq-1', topic: 'stack-queue', type: 'mcq', prompt: 'Which ordering principle does a stack follow?', answer: 'Last in, first out', wrong: ['First in, first out', 'Smallest value first', 'Random access by index'],
    explanation: 'Push and pop both work on the top, so the most recently pushed value is the first one popped.' }),
  q({ id: 'sq-2', topic: 'stack-queue', type: 'mcq', prompt: 'Which ordering principle does a queue follow?', answer: 'First in, first out', wrong: ['Last in, first out', 'Largest value first', 'Alphabetical order'],
    explanation: 'Values are added at the rear and removed from the front, so the value that has waited longest leaves first.' }),
  q({ id: 'sq-3', topic: 'stack-queue', type: 'next-op', prompt: 'Start with an empty stack: push(4), push(9), pop(), push(2). What does the stack hold from bottom to top?', answer: stackFinal, wrong: ['4, 9, 2', '2, 4', '9, 2'],
    explanation: 'After the two pushes the stack is 4, 9. pop() removes the top (9), leaving 4. push(2) puts 2 on top: 4, 2.' }),
  q({ id: 'sq-4', topic: 'stack-queue', type: 'next-op', prompt: 'Start with an empty queue: enqueue(5), enqueue(8), dequeue(), enqueue(1). What does the queue hold from front to rear?', answer: queueFinal, wrong: ['5, 1', '1, 8', '5, 8, 1'],
    explanation: 'The queue is 5, 8. dequeue() removes the front value (5), leaving 8. enqueue(1) adds at the rear: 8, 1.' }),
  q({ id: 'sq-5', topic: 'stack-queue', type: 'mcq', prompt: 'Which structure is the natural fit for an editor\'s undo history?', answer: 'A stack', wrong: ['A queue', 'A sorted array', 'A binary tree'],
    explanation: 'Undo reverses the most recent action first, which is last in, first out.' }),
  q({ id: 'sq-6', topic: 'stack-queue', type: 'mcq', prompt: 'Which structure is the natural fit for print jobs that must be served in the order they arrive?', answer: 'A queue', wrong: ['A stack', 'A max-heap', 'A binary search tree'],
    explanation: 'The job that arrived first should be printed first, which is first in, first out.' }),
  q({ id: 'sq-7', topic: 'stack-queue', type: 'complexity', prompt: 'What is the time complexity of push and pop on an array-based stack?', answer: 'O(1)', wrong: ['O(n)', 'O(log n)', 'O(n log n)'],
    explanation: 'Both only change the top index and one array slot.' }),
  q({ id: 'sq-8', topic: 'stack-queue', type: 'next-op', prompt: 'A stack holds 2, 5, 9 with 9 on top. What does pop() return?', answer: String(stackPop), wrong: ['2', '5', 'Nothing: it is an error'],
    explanation: 'pop removes and returns the top value, which is 9. The stack then holds 2, 5.' }),
  q({ id: 'sq-9', topic: 'stack-queue', type: 'mcq', prompt: 'What should pop() do on an empty stack?', answer: 'Report underflow, for example by throwing an exception', wrong: ['Return 0', 'Remove the bottom value', 'Do nothing silently'],
    explanation: 'There is no value to return, so the caller must be told. Returning a made-up value would hide a bug.' }),

  traversalQuestion('tree-a', '1 2 3 4 5', 'preorder'),
  traversalQuestion('tree-b', '1 2 3 4 5', 'postorder'),
  traversalQuestion('tree-c', '8 3 10 1 6 null 14', 'inorder'),
  traversalQuestion('tree-d', '8 3 10 1 6 null 14', 'levelorder'),
  traversalQuestion('tree-e', '5 3 8 2 4 7 9', 'inorder'),
  traversalQuestion('tree-f', '1 null 2 3', 'postorder'),
  traversalQuestion('tree-g', '4 2 6 1 3 5 7', 'preorder'),
  q({ id: 'tree-1', topic: 'trees', type: 'mcq', prompt: 'Which depth-first traversal visits a node before either of its subtrees?', answer: 'Preorder', wrong: ['Inorder', 'Postorder', 'None of them'],
    explanation: 'Preorder is node, left, right.' }),
  q({ id: 'tree-2', topic: 'trees', type: 'mcq', prompt: 'Which traversal always visits the root last?', answer: 'Postorder', wrong: ['Preorder', 'Inorder', 'Level-order'],
    explanation: 'Postorder is left, right, node, so the root comes after everything else.' }),
  q({ id: 'tree-3', topic: 'trees', type: 'mcq', prompt: 'In what order does an inorder traversal of a binary search tree visit the values?', answer: 'Ascending (sorted) order', wrong: ['Descending order', 'Level by level', 'Insertion order'],
    explanation: 'Everything in the left subtree is smaller than the node and everything in the right subtree is larger, so left, node, right produces sorted order.' }),
  q({ id: 'tree-4', topic: 'trees', type: 'mcq', prompt: 'Which data structure does level-order traversal use?', answer: 'A queue', wrong: ['A stack', 'A hash set', 'A sorted array'],
    explanation: 'Children are added to the back and nodes are taken from the front, so each level is finished before the next one starts.' }),
  q({ id: 'tree-5', topic: 'trees', type: 'mcq', prompt: 'What does a recursive depth-first traversal rely on to remember where to go back to?', answer: 'The call stack', wrong: ['A queue', 'A hash map', 'Parent pointers stored in every node'],
    explanation: 'Each recursive call is pushed on the call stack and popped when both subtrees are done, which returns control to the parent.' }),
  q({ id: 'tree-6', topic: 'trees', type: 'complexity', prompt: 'What is the time complexity of any standard traversal of a binary tree with n nodes?', answer: 'O(n)', wrong: ['O(log n)', 'O(n log n)', 'O(n²)'],
    explanation: 'Every node is visited exactly once, and each visit does a constant amount of work.' }),
];

/**
 * Deterministic selection: questions never attempted come first, in bank order.
 * Once everything has been attempted, the least recently attempted question is next.
 * The question just shown is skipped when there is any alternative.
 */
export function pickNext(pool, practice, currentId = null) {
  const candidates = pool.filter((x) => x.id !== currentId);
  const list = candidates.length ? candidates : pool;
  if (!list.length) return null;
  const fresh = list.find((x) => !practice[x.id]);
  if (fresh) return fresh;
  return [...list].sort((a, b) => practice[a.id].lastAt - practice[b.id].lastAt)[0];
}
