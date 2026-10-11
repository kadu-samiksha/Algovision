# AlgoVision

> Don't just learn algorithms. See them think.

An interactive data structures and algorithms visualizer built with React, Vite and plain JavaScript. Every algorithm runs locally in the browser. There is no backend and no external API.

## What is implemented

| Area | Visualizers |
| --- | --- |
| Sorting | Bubble, Selection, Insertion, Merge (with buffer view), Quick (pivot and partition groups), Heap (active heap region) |
| Searching | Linear, Binary (validates sorted input, never sorts silently) |
| Stacks and Queues | Push, Pop, Peek, Size, Clear / Enqueue, Dequeue, Peek, Size, Clear, with TOP, FRONT and REAR labels and empty/full handling |
| Linked List | Insert at beginning, end or position; delete by value; search; traverse; clear. Pointer changes shown step by step |
| Binary Trees | Preorder, Inorder, Postorder, Level-order on a tree you build from level-order input; call stack or queue shown |
| Practice Arena | 49 fixed questions: multiple choice, predict the next operation, predict the traversal, identify the complexity |
| Progress | Topics visited, visualizations completed, practice attempted and correct, with a confirmed reset |

Every visualizer has play, pause, previous, next, reset, a step scrubber and five speeds (except stacks and queues, which respond to each operation directly). Each shows live counters, a "What's happening?" explanation built from the real values, a complexity panel, and a Java reference panel with the current line highlighted.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # 140 unit and integration tests (Vitest + Testing Library)
npm run build     # static site in dist/
npm run preview   # serve the production build locally
```

Deploy by uploading `dist/` to any static host. Routing uses `HashRouter` and relative asset paths, so no rewrite rules are needed.

## How it works

- **Algorithms record steps.** Each generator runs once and returns an array of immutable snapshots (data, highlights, counters, explanation text, Java line numbers). Algorithm code lives in `src/algorithms/` and knows nothing about React.
- **Playback only stores `{ index, playing }`.** `usePlayback` walks the recorded steps. Previous, Next and scrubbing only change the index, so counters, text and highlights cannot drift apart. One timeout exists at a time and is cleared on pause, seek, speed change, step change and unmount.
- **Java code panel.** The Java is reference code and is **not executed**. Each step lists the Java lines it corresponds to as fixed metadata, and tests check that every step maps to real lines that have an explanation.
- **Adding an algorithm:** write the step generator, register it in `algorithms/sorting/index.js` (or the matching folder), add it to `data/catalog.js` and `utils/complexity.js`. The generic sorting tests then check it automatically.

### Counting conventions
- **Comparisons:** each evaluation of the algorithm's comparison (for example `arr[j] > arr[j + 1]`).
- **Swaps:** each exchange of two positions.
- **Writes:** each assignment into the array (Insertion and Merge Sort). Writes are never labelled swaps.
- **Steps:** step 0 is the starting state; total steps counts the states after it.

### Tree input format
Values row by row, left to right, with `null` for a missing child. A null node has no child slots, so its children are not listed. `1 2 3 null 4` is root 1 with children 2 and 3, where 2 has only a right child 4. An empty field is an empty tree. Up to 31 nodes.

### Keyboard shortcuts (visualizer pages)
Space play/pause, Left/Right previous/next, R reset, G new array (sorting and searching). Paused while typing and while a dialog is open.

## Testing

`npm test` covers: all six sorts against every permutation up to 6 elements (duplicates, negatives, sorted, reversed, size 40) with per-step checks of counters, highlights and Java line metadata; linear and binary search against reference results; stack and queue rules; linked list operations against an array model; tree parsing, layout and all four traversals against independent implementations; playback timing; storage sanitising; the question bank; and rendered-page flows for every route.

## Known limitations
- Verified in jsdom, not yet by eye in real browsers. Do a visual pass on desktop and a phone before publishing.
- The reset-confirmation dialog uses the native `<dialog>`, which jsdom cannot open, so that interaction is untested.
- Negative values are drawn scaled from the smallest value (noted in the UI) rather than with a zero baseline.
- Linked list: singly linked only, up to 10 nodes. Stack and queue: capacity 10. Arrays: 2 to 40 values.
- Progress is per browser and not synced. Dark theme only.
