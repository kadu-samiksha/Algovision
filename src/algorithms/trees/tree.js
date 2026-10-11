export const MAX_TREE_NODES = 31;
export const EXAMPLE_TREE = '1 2 3 4 5 null 6';

/**
 * Level-order input: values row by row, `null` (or #, -, x) for a missing child.
 * Children of a missing node are not listed (LeetCode style). Example: "1 2 3 null 4" is
 * root 1, children 2 and 3, and node 2 has only a right child 4.
 * Nodes are numbered in the order they are created, so ids follow level order.
 */
export function parseLevelOrder(text) {
  const tokens = String(text ?? '').trim().split(/[\s,;]+/).filter(Boolean);
  if (!tokens.length) return { ok: true, nodes: [], root: null, empty: true };
  const NULLS = new Set(['null', '#', '-', 'x', 'none']);
  const vals = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].toLowerCase();
    if (NULLS.has(t)) vals.push(null);
    else if (/^[+-]?\d+$/.test(t)) {
      const v = Number(t) + 0;
      if (v < -999 || v > 999) return { ok: false, error: `${v} is out of range. Keep values between -999 and 999.` };
      vals.push(v);
    } else return { ok: false, error: `"${tokens[i]}" is not a whole number or null (entry ${i + 1}).` };
  }
  if (vals[0] === null) return { ok: true, nodes: [], root: null, empty: true };
  const nodes = [];
  const make = (value) => {
    nodes.push({ id: nodes.length, value, left: null, right: null });
    return nodes.length - 1;
  };
  const root = make(vals[0]);
  const queue = [root];
  let idx = 1;
  while (queue.length && idx < vals.length) {
    const parent = queue.shift();
    for (const side of ['left', 'right']) {
      if (idx >= vals.length) break;
      const v = vals[idx++];
      if (v !== null) {
        if (nodes.length >= MAX_TREE_NODES) return { ok: false, error: `Use at most ${MAX_TREE_NODES} nodes so the tree fits on screen.` };
        const id = make(v);
        nodes[parent][side] = id;
        queue.push(id);
      }
    }
  }
  const stray = vals.slice(idx).findIndex((v) => v !== null);
  if (stray !== -1) {
    return { ok: false, error: `Entry ${idx + stray + 1} has no parent: every earlier slot is either filled or belongs to a null node. Remember that a null node has no child slots.` };
  }
  return { ok: true, nodes, root, empty: false };
}

/** Inorder rank gives x, depth gives y, so parents sit between their children and nothing overlaps. */
export function layoutTree(nodes, root) {
  if (root === null) return { positions: [], edges: [], width: 0, height: 0 };
  const pos = {};
  let rank = 0;
  let maxDepth = 0;
  const walk = (id, depth) => {
    if (id === null) return;
    walk(nodes[id].left, depth + 1);
    pos[id] = { x: rank++, y: depth };
    maxDepth = Math.max(maxDepth, depth);
    walk(nodes[id].right, depth + 1);
  };
  walk(root, 0);
  const GAP_X = 52;
  const GAP_Y = 64;
  const PAD = 34;
  const positions = nodes.map((n) => ({ id: n.id, value: n.value, x: PAD + pos[n.id].x * GAP_X, y: PAD + pos[n.id].y * GAP_Y, rank: pos[n.id].x }));
  const edges = [];
  nodes.forEach((n) => {
    if (n.left !== null) edges.push({ from: n.id, to: n.left });
    if (n.right !== null) edges.push({ from: n.id, to: n.right });
  });
  return { positions, edges, width: PAD * 2 + (rank - 1) * GAP_X, height: PAD * 2 + maxDepth * GAP_Y };
}

const dfsJava = (name, order) => {
  const left = `    ${name}(node.left);`;
  const right = `    ${name}(node.right);`;
  const visit = '    visit(node);';
  const body = { pre: [visit, left, right], in: [left, visit, right], post: [left, right, visit] }[order];
  return [`static void ${name}(TreeNode node) {`, '    if (node == null) return;', ...body, '}'];
};
const DFS_NOTES = {
  pre: { 1: 'Each call handles one node. The root call starts the traversal.', 2: 'A null child ends the call immediately.', 3: 'Preorder visits the node first, before either subtree.', 4: 'Recursive call: go down into the left subtree. It completes before the next line runs.', 5: 'Recursive call: go down into the right subtree.', 6: 'Both subtrees are finished, so the call returns to its parent.' },
  in: { 1: 'Each call handles one node. The root call starts the traversal.', 2: 'A null child ends the call immediately.', 3: 'Recursive call: go down into the left subtree. Inorder finishes it before visiting this node.', 4: 'Inorder visits the node after its left subtree and before its right subtree.', 5: 'Recursive call: go down into the right subtree.', 6: 'Both subtrees are finished, so the call returns to its parent.' },
  post: { 1: 'Each call handles one node. The root call starts the traversal.', 2: 'A null child ends the call immediately.', 3: 'Recursive call: go down into the left subtree.', 4: 'Recursive call: go down into the right subtree.', 5: 'Postorder visits the node last, after both subtrees are finished.', 6: 'Both subtrees are finished, so the call returns to its parent.' },
};
const LEVEL_JAVA = {
  lines: [
    'static void levelOrder(TreeNode root) {',
    '    if (root == null) return;',
    '    Queue<TreeNode> queue = new ArrayDeque<>();',
    '    queue.add(root);',
    '    while (!queue.isEmpty()) {',
    '        TreeNode node = queue.remove();',
    '        visit(node);',
    '        if (node.left != null) queue.add(node.left);',
    '        if (node.right != null) queue.add(node.right);',
    '    }',
    '}',
  ],
  notes: {
    1: 'Level-order uses a queue instead of recursion.', 2: 'An empty tree has nothing to visit.', 3: 'A FIFO queue holds the nodes waiting to be visited.',
    4: 'Start with the root in the queue.', 5: 'Keep going while there are nodes waiting.', 6: 'Remove the node at the front of the queue. The oldest waiting node always goes first.',
    7: 'Visit the node: it is added to the output.', 8: 'Add the left child to the back of the queue so it is visited after the current level.', 9: 'Add the right child to the back of the queue.',
    10: 'The queue is empty, so every level has been visited.',
  },
};

export const TRAVERSALS = {
  preorder: { slug: 'preorder', topicId: 'tree-preorder', name: 'Preorder Traversal', short: 'Preorder', order: 'pre', rule: 'Node, then left subtree, then right subtree', java: { lines: dfsJava('preorder', 'pre'), notes: DFS_NOTES.pre }, difficulty: 'Intermediate' },
  inorder: { slug: 'inorder', topicId: 'tree-inorder', name: 'Inorder Traversal', short: 'Inorder', order: 'in', rule: 'Left subtree, then node, then right subtree', java: { lines: dfsJava('inorder', 'in'), notes: DFS_NOTES.in }, difficulty: 'Intermediate' },
  postorder: { slug: 'postorder', topicId: 'tree-postorder', name: 'Postorder Traversal', short: 'Postorder', order: 'post', rule: 'Left subtree, then right subtree, then node', java: { lines: dfsJava('postorder', 'post'), notes: DFS_NOTES.post }, difficulty: 'Intermediate' },
  levelorder: { slug: 'levelorder', topicId: 'tree-levelorder', name: 'Level-order Traversal', short: 'Level-order', order: 'level', rule: 'Level by level, left to right, using a queue', java: LEVEL_JAVA, difficulty: 'Intermediate' },
};

const LINES = { pre: { visit: 3, left: 4, right: 5 }, in: { visit: 4, left: 3, right: 5 }, post: { visit: 5, left: 3, right: 4 } };
const VISIT_TEXT = {
  pre: (v) => `Visit ${v}. Preorder visits a node before either of its subtrees.`,
  in: (v) => `Visit ${v}. Its left subtree is finished, so inorder visits the node now, before its right subtree.`,
  post: (v) => `Visit ${v}. Both of its subtrees are finished, so postorder visits the node last.`,
};

export function traversalSteps(nodes, root, kind) {
  const t = TRAVERSALS[kind];
  const steps = [];
  const visited = [];
  const output = [];
  let stack = [];
  const push = (s) => steps.push({ current: null, ...s, line: s.lines[0], visited: [...visited], output: [...output], stack: [...stack], structure: kind === 'levelorder' ? 'Queue' : 'Call stack' });
  const val = (id) => nodes[id].value;

  if (root === null) {
    push({ type: 'start', title: 'Ready', lines: [1], text: 'The tree is empty, so there is nothing to visit.' });
    push({ type: 'done', title: 'Done', lines: [t.order === 'level' ? 11 : 6], text: 'The traversal output is empty.' });
    return steps;
  }

  if (t.order === 'level') {
    push({ type: 'start', title: 'Ready', lines: [1, 2], text: 'Level-order visits the tree one level at a time, using a queue.' });
    stack = [root];
    push({ type: 'enqueue', title: 'Queue the root', lines: [3, 4], text: `Create a queue and add the root (${val(root)}) to it.` });
    while (stack.length) {
      const id = stack[0];
      stack = stack.slice(1);
      push({ type: 'dequeue', title: 'Dequeue', lines: [5, 6], current: id, text: `Remove ${val(id)} from the front of the queue.` });
      visited.push(id);
      output.push(val(id));
      push({ type: 'visit', title: 'Visit', lines: [7], current: id, text: `Visit ${val(id)}. Output so far: ${output.join(', ')}.` });
      const kids = [['left', nodes[id].left, 8], ['right', nodes[id].right, 9]].filter((k) => k[1] !== null);
      if (!kids.length) push({ type: 'leaf', title: 'No children', lines: [8], current: id, text: `${val(id)} has no children, so nothing is added to the queue.` });
      for (const [side, kid, line] of kids) {
        stack = [...stack, kid];
        push({ type: 'enqueue', title: `Queue the ${side} child`, lines: [line], current: id, text: `Add the ${side} child ${val(kid)} to the back of the queue. It will be visited after everything already waiting.` });
      }
    }
    push({ type: 'done', title: 'Done', lines: [10, 11], text: `The queue is empty. Level-order output: ${output.join(', ')}.` });
    return steps;
  }

  const L = LINES[t.order];
  push({ type: 'start', title: 'Ready', lines: [1], text: `${t.short} traversal: ${t.rule.toLowerCase()}.` });
  function call(id, parent, side) {
    if (id === null) {
      push({ type: 'null', title: 'Empty subtree', lines: [side === 'left' ? L.left : L.right, 1, 2], current: parent,
        text: `The ${side} child of ${val(parent)} is null, so that call returns immediately.` });
      return;
    }
    stack = [...stack, id];
    const callLine = parent === null ? [1, 2] : [side === 'left' ? L.left : L.right, 1, 2];
    push({ type: 'call', title: 'Call', lines: callLine, current: id,
      text: parent === null ? `Call ${t.short.toLowerCase()} on the root ${val(id)}. The call stack holds 1 call.` : `Call ${t.short.toLowerCase()} on the ${side} child ${val(id)}. The call stack now holds ${stack.length} calls.` });
    const doVisit = () => {
      visited.push(id);
      output.push(val(id));
      push({ type: 'visit', title: 'Visit', lines: [L.visit], current: id, text: `${VISIT_TEXT[t.order](val(id))} Output so far: ${output.join(', ')}.` });
    };
    if (t.order === 'pre') doVisit();
    call(nodes[id].left, id, 'left');
    if (t.order === 'in') doVisit();
    call(nodes[id].right, id, 'right');
    if (t.order === 'post') doVisit();
    push({ type: 'return', title: 'Return', lines: [6], current: id, text: `Both subtrees of ${val(id)} are done, so this call returns${stack.length > 1 ? ' to its parent' : ' and the traversal ends'}.` });
    stack = stack.slice(0, -1);
  }
  call(root, null, null);
  push({ type: 'done', title: 'Done', lines: [6], text: `Traversal complete. ${t.short} output: ${output.join(', ')}.` });
  return steps;
}

/** Independent reference implementations used by tests and the practice question generator. */
export function traversalOutput(nodes, root, kind) {
  if (root === null) return [];
  if (kind === 'levelorder') {
    const out = [];
    const q = [root];
    while (q.length) {
      const id = q.shift();
      out.push(nodes[id].value);
      if (nodes[id].left !== null) q.push(nodes[id].left);
      if (nodes[id].right !== null) q.push(nodes[id].right);
    }
    return out;
  }
  const out = [];
  const go = (id) => {
    if (id === null) return;
    if (kind === 'preorder') out.push(nodes[id].value);
    go(nodes[id].left);
    if (kind === 'inorder') out.push(nodes[id].value);
    go(nodes[id].right);
    if (kind === 'postorder') out.push(nodes[id].value);
  };
  go(root);
  return out;
}
