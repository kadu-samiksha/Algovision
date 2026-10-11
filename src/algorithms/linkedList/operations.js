export const MAX_NODES = 10;

export const JAVA = {
  lines: [
    'class Node { int val; Node next; Node(int val) { this.val = val; } }',
    '',
    'class SinglyLinkedList {',
    '    Node head;',
    '',
    '    void insertAtHead(int v) {',
    '        Node node = new Node(v);',
    '        node.next = head;',
    '        head = node;',
    '    }',
    '    void insertAtTail(int v) {',
    '        Node node = new Node(v);',
    '        if (head == null) { head = node; return; }',
    '        Node cur = head;',
    '        while (cur.next != null) cur = cur.next;',
    '        cur.next = node;',
    '    }',
    '    void insertAt(int pos, int v) {   // 0 <= pos <= size',
    '        if (pos == 0) { insertAtHead(v); return; }',
    '        Node prev = head;',
    '        for (int i = 0; i < pos - 1; i++) prev = prev.next;',
    '        Node node = new Node(v);',
    '        node.next = prev.next;',
    '        prev.next = node;',
    '    }',
    '    boolean deleteValue(int v) {',
    '        if (head == null) return false;',
    '        if (head.val == v) { head = head.next; return true; }',
    '        Node prev = head;',
    '        while (prev.next != null && prev.next.val != v) prev = prev.next;',
    '        if (prev.next == null) return false;',
    '        prev.next = prev.next.next;',
    '        return true;',
    '    }',
    '    int indexOf(int v) {',
    '        Node cur = head;',
    '        for (int i = 0; cur != null; i++, cur = cur.next)',
    '            if (cur.val == v) return i;',
    '        return -1;',
    '    }',
    '    void traverse() {',
    '        for (Node cur = head; cur != null; cur = cur.next)',
    '            System.out.print(cur.val + " ");',
    '    }',
    '    void clear() { head = null; }',
    '}',
  ],
  notes: {
    6: 'insertAtHead puts a new node in front of the current head.',
    7: 'Create the new node. Its next pointer is null until it is linked.',
    8: 'Point the new node at the old head, so nothing in the list is lost.',
    9: 'Move head to the new node. Now the list starts with it.',
    11: 'insertAtTail adds a node after the last one.',
    12: 'Create the new node with next = null.',
    13: 'In an empty list the new node simply becomes the head.',
    14: 'Start at the head. Without a tail pointer we have to walk to the end.',
    15: 'Walk forward until cur.next is null, which means cur is the last node.',
    16: 'Link the last node to the new node. The new node becomes the tail.',
    18: 'insertAt places a node so that it ends up at index pos.',
    19: 'Position 0 is the same as inserting at the head.',
    20: 'prev must end up at the node just before the insertion point.',
    21: 'Move prev forward pos - 1 times.',
    22: 'Create the new node.',
    23: 'First point the new node at the node that follows prev. Doing this first keeps the rest of the list reachable.',
    24: 'Then point prev at the new node. The new node is now linked in.',
    26: 'deleteValue removes the first node holding v.',
    27: 'An empty list has nothing to delete.',
    28: 'If the head holds v, just move head to the next node.',
    29: 'Otherwise start with prev at the head.',
    30: 'Advance prev until the node after it holds v or the end is reached.',
    31: 'Reaching the end means v is not in the list, so nothing changes.',
    32: 'Skip over the target: prev.next now points past it, so the node is unlinked.',
    35: 'indexOf returns the position of the first node holding v, or -1.',
    36: 'Start at the head.',
    37: 'Move cur along the list while counting the index i.',
    38: 'Compare the current value with v. A match returns its index.',
    39: 'Reaching null means every node was checked without a match.',
    41: 'traverse visits every node from head to the end.',
    42: 'cur starts at head and follows next pointers until it becomes null.',
    43: 'Visit the node: here it prints the value.',
    45: 'clear sets head to null. The nodes become unreachable and are garbage collected.',
  },
};

const OPS = {
  insertHead: { label: 'Insert at beginning', complexity: 'O(1)', why: 'Only head changes, no matter how long the list is.', header: 6 },
  insertTail: { label: 'Insert at end', complexity: 'O(n)', why: 'Without a tail pointer the whole list must be walked to find the last node.', header: 11 },
  insertAt: { label: 'Insert at position', complexity: 'O(n)', why: 'The list is walked up to the insertion point (O(1) when the position is 0).', header: 18 },
  deleteValue: { label: 'Delete by value', complexity: 'O(n)', why: 'The list is searched for the value; the pointer change itself is O(1).', header: 26 },
  search: { label: 'Search', complexity: 'O(n)', why: 'Nodes are checked one by one, and a missing value checks all of them.', header: 35 },
  traverse: { label: 'Traverse', complexity: 'O(n)', why: 'Every node is visited exactly once.', header: 41 },
  clear: { label: 'Clear', complexity: 'O(1)', why: 'Only head is reset; the nodes are reclaimed by the garbage collector.', header: 45 },
};
export { OPS };

const vals = (nodes) => (nodes.length ? nodes.map((n) => n.value).join(' → ') + ' → null' : 'empty (HEAD → null)');

class Recorder {
  constructor(op, nodes) {
    this.op = op;
    this.steps = [];
    this.cur = nodes.map((n) => ({ ...n }));
  }
  push(s) {
    this.steps.push({
      current: null, prev: null, found: null, removing: null, bypass: null, floating: null, output: null,
      ...s,
      nodes: s.nodes ? s.nodes.map((n) => ({ ...n })) : this.cur.map((n) => ({ ...n })),
      line: s.lines[0], op: this.op, complexity: OPS[this.op].complexity, why: OPS[this.op].why,
    });
  }
}

const fail = (error) => ({ ok: false, error, steps: [], nodes: null });
const finish = (rec, nodes, extra = {}) => ({ ok: true, error: null, steps: rec.steps, nodes, ...extra });

function checkRoom(nodes) {
  return nodes.length >= MAX_NODES ? `The list is full: this demo holds at most ${MAX_NODES} nodes so they fit on screen.` : null;
}

export function insertHead(nodes, value, newId) {
  const err = checkRoom(nodes);
  if (err) return fail(err);
  const r = new Recorder('insertHead', nodes);
  const head = nodes[0];
  r.push({ type: 'start', title: 'Ready', lines: [6], text: `insertAtHead(${value}) on ${vals(nodes)}.` });
  r.push({ type: 'create', title: 'Create node', lines: [7], floating: { id: newId, value, next: null }, text: `Create a new node holding ${value}. Its next pointer is null for now.` });
  r.push({ type: 'link', title: 'Link to old head', lines: [8], floating: { id: newId, value, next: head ? head.value : null },
    text: head ? `Point the new node's next at the current head (${head.value}), so the existing list stays reachable.` : 'The list is empty, so the new node\'s next stays null.' });
  const next = [{ id: newId, value }, ...nodes];
  r.push({ type: 'move-head', title: 'Move HEAD', lines: [9], nodes: next, current: newId, text: `Move HEAD to the new node. The list is now ${vals(next)}.` });
  return finish(r, next);
}

export function insertTail(nodes, value, newId) {
  const err = checkRoom(nodes);
  if (err) return fail(err);
  const r = new Recorder('insertTail', nodes);
  r.push({ type: 'start', title: 'Ready', lines: [11], text: `insertAtTail(${value}) on ${vals(nodes)}.` });
  r.push({ type: 'create', title: 'Create node', lines: [12], floating: { id: newId, value, next: null }, text: `Create a new node holding ${value}. Its next pointer is null.` });
  if (!nodes.length) {
    const next = [{ id: newId, value }];
    r.push({ type: 'move-head', title: 'Becomes the head', lines: [13], nodes: next, current: newId, text: 'The list is empty, so the new node simply becomes the head.' });
    return finish(r, next);
  }
  r.push({ type: 'traverse', title: 'Start at head', lines: [14], current: nodes[0].id, floating: { id: newId, value, next: null }, text: `Set cur to the head (${nodes[0].value}).` });
  for (let i = 0; i < nodes.length - 1; i++) {
    r.push({ type: 'traverse', title: 'Advance', lines: [15], current: nodes[i + 1].id, floating: { id: newId, value, next: null },
      text: `cur.next is not null, so move cur forward to ${nodes[i + 1].value}.` });
  }
  const next = [...nodes, { id: newId, value }];
  r.push({ type: 'link', title: 'Link the tail', lines: [16], nodes: next, current: newId, prev: nodes.at(-1).id,
    text: `cur.next is null, so ${nodes.at(-1).value} is the last node. Set cur.next to the new node. The list is now ${vals(next)}.` });
  return finish(r, next);
}

export function insertAt(nodes, pos, value, newId) {
  if (!Number.isInteger(pos) || pos < 0 || pos > nodes.length) {
    return fail(`Position ${Number.isNaN(pos) ? '' : pos} is not valid. For a list of ${nodes.length} node${nodes.length === 1 ? '' : 's'}, use a whole number from 0 to ${nodes.length}.`.replace('  ', ' '));
  }
  const err = checkRoom(nodes);
  if (err) return fail(err);
  const r = new Recorder('insertAt', nodes);
  r.push({ type: 'start', title: 'Ready', lines: [18], text: `insertAt(${pos}, ${value}) on ${vals(nodes)}. Positions start at 0.` });
  if (pos === 0) {
    r.push({ type: 'delegate', title: 'Position 0', lines: [19], text: 'Position 0 means the new node becomes the head, which is exactly insertAtHead.' });
    const head = nodes[0];
    r.push({ type: 'create', title: 'Create node', lines: [7], floating: { id: newId, value, next: null }, text: `Create a new node holding ${value}.` });
    r.push({ type: 'link', title: 'Link to old head', lines: [8], floating: { id: newId, value, next: head ? head.value : null },
      text: head ? `Point the new node's next at the current head (${head.value}).` : 'The list is empty, so next stays null.' });
    const next = [{ id: newId, value }, ...nodes];
    r.push({ type: 'move-head', title: 'Move HEAD', lines: [9], nodes: next, current: newId, text: `Move HEAD to the new node. The list is now ${vals(next)}.` });
    return finish(r, next);
  }
  r.push({ type: 'traverse', title: 'Start at head', lines: [20], prev: nodes[0].id, text: `Set prev to the head (${nodes[0].value}). It must end at index ${pos - 1}.` });
  for (let i = 1; i <= pos - 1; i++) {
    r.push({ type: 'traverse', title: 'Advance', lines: [21], prev: nodes[i].id, text: `Move prev forward to index ${i} (${nodes[i].value}).` });
  }
  const prev = nodes[pos - 1];
  const after = nodes[pos];
  r.push({ type: 'create', title: 'Create node', lines: [22], prev: prev.id, floating: { id: newId, value, next: null }, text: `Create a new node holding ${value}.` });
  r.push({ type: 'link', title: 'Point new node at the rest', lines: [23], prev: prev.id, floating: { id: newId, value, next: after ? after.value : null },
    text: after ? `Set node.next to prev.next (${after.value}) first, so the rest of the list stays reachable.` : 'prev.next is null, so the new node\'s next is null too.' });
  const next = [...nodes.slice(0, pos), { id: newId, value }, ...nodes.slice(pos)];
  r.push({ type: 'link', title: 'Point prev at new node', lines: [24], nodes: next, prev: prev.id, current: newId,
    text: `Set prev.next to the new node. The list is now ${vals(next)}.` });
  return finish(r, next);
}

export function deleteValue(nodes, value) {
  const r = new Recorder('deleteValue', nodes);
  r.push({ type: 'start', title: 'Ready', lines: [26], text: `deleteValue(${value}) on ${vals(nodes)}.` });
  if (!nodes.length) {
    r.push({ type: 'empty', title: 'Empty list', lines: [27], text: 'The list is empty, so there is nothing to delete.' });
    return finish(r, nodes, { changed: false });
  }
  r.push({ type: 'check', title: 'Check the head', lines: [28], current: nodes[0].id, text: `Is the head's value ${nodes[0].value} equal to ${value}?` });
  if (nodes[0].value === value) {
    r.push({ type: 'bypass', title: 'Move HEAD', lines: [28], removing: nodes[0].id, text: `Yes. Move HEAD to the next node${nodes[1] ? ` (${nodes[1].value})` : ' (null)'}. The old head is unlinked.` });
    const next = nodes.slice(1);
    r.push({ type: 'removed', title: 'Removed', lines: [28], nodes: next, text: `${value} was removed. The list is now ${vals(next)}.` });
    return finish(r, next, { changed: true });
  }
  r.push({ type: 'traverse', title: 'Not the head', lines: [29], prev: nodes[0].id, text: `No. Set prev to the head (${nodes[0].value}) and look at prev.next.` });
  for (let i = 0; i < nodes.length - 1; i++) {
    const prev = nodes[i];
    const target = nodes[i + 1];
    r.push({ type: 'check', title: 'Check next node', lines: [30], prev: prev.id, current: target.id, text: `Is prev.next (${target.value}) equal to ${value}?` });
    if (target.value === value) {
      r.push({ type: 'bypass', title: 'Skip the node', lines: [32], prev: prev.id, bypass: prev.id, removing: target.id,
        text: `Yes. Set prev.next to prev.next.next${nodes[i + 2] ? ` (${nodes[i + 2].value})` : ' (null)'}. The node holding ${value} is now skipped, so it is unlinked.` });
      const next = nodes.filter((n) => n.id !== target.id);
      r.push({ type: 'removed', title: 'Removed', lines: [32], nodes: next, prev: prev.id, text: `${value} was removed. The list is now ${vals(next)}.` });
      return finish(r, next, { changed: true });
    }
    if (i < nodes.length - 2) {
      r.push({ type: 'traverse', title: 'Advance', lines: [30], prev: target.id, text: `${target.value} is not ${value}. Move prev forward to ${target.value}.` });
    }
  }
  r.push({ type: 'not-found', title: 'Not found', lines: [31], text: `Reached the end without finding ${value}. The list is unchanged.` });
  return finish(r, nodes, { changed: false });
}

export function searchValue(nodes, value) {
  const r = new Recorder('search', nodes);
  r.push({ type: 'start', title: 'Ready', lines: [35], text: `indexOf(${value}) on ${vals(nodes)}.` });
  for (let i = 0; i < nodes.length; i++) {
    r.push({ type: 'check', title: 'Check node', lines: [37, 38], current: nodes[i].id, text: `Index ${i}: is ${nodes[i].value} equal to ${value}?` });
    if (nodes[i].value === value) {
      r.push({ type: 'found', title: 'Found', lines: [38], current: nodes[i].id, found: nodes[i].id, text: `Yes. ${value} is at index ${i}, so indexOf returns ${i}.` });
      return finish(r, nodes, { index: i });
    }
  }
  r.push({ type: 'not-found', title: 'Not found', lines: [39], text: nodes.length ? `cur reached null without a match, so indexOf returns -1.` : 'The list is empty, so indexOf returns -1.' });
  return finish(r, nodes, { index: -1 });
}

export function traverseList(nodes) {
  const r = new Recorder('traverse', nodes);
  r.push({ type: 'start', title: 'Ready', lines: [41], output: [], text: `traverse() on ${vals(nodes)}.` });
  const out = [];
  nodes.forEach((n, i) => {
    out.push(n.value);
    r.push({ type: 'visit', title: 'Visit node', lines: [42, 43], current: n.id, output: [...out], text: `cur is at index ${i}: visit ${n.value}.` });
  });
  r.push({ type: 'done', title: 'End of list', lines: [42], output: [...out], text: nodes.length ? `cur became null, so the traversal is complete. Visited: ${out.join(', ')}.` : 'The list is empty, so there is nothing to visit.' });
  return finish(r, nodes, { output: out });
}

export function clearList(nodes) {
  const r = new Recorder('clear', nodes);
  r.push({ type: 'start', title: 'Ready', lines: [45], text: `clear() on ${vals(nodes)}.` });
  r.push({ type: 'clear', title: 'Set head to null', lines: [45], nodes: [], text: nodes.length ? `Set head to null. The ${nodes.length} node${nodes.length === 1 ? '' : 's'} can no longer be reached, so the list is empty.` : 'The list was already empty.' });
  return finish(r, []);
}
