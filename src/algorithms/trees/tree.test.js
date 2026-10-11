import { describe, expect, test } from 'vitest';
import { EXAMPLE_TREE, TRAVERSALS, layoutTree, parseLevelOrder, traversalOutput, traversalSteps } from './tree.js';

const tree = (s) => parseLevelOrder(s);

describe('parseLevelOrder', () => {
  test('builds the documented example', () => {
    const t = tree('1 2 3 null 4');
    expect(t.ok).toBe(true);
    expect(t.nodes.map((n) => [n.value, n.left, n.right])).toEqual([[1, 1, 2], [2, null, 3], [3, null, null], [4, null, null]]);
  });
  test('empty input and null root are empty trees', () => {
    expect(tree('').empty).toBe(true);
    expect(tree('null').empty).toBe(true);
  });
  test('trailing nulls are fine; orphan values and bad tokens are errors', () => {
    expect(tree('1 null null null null').ok).toBe(true);
    expect(tree('1 null null 5').ok).toBe(false);
    expect(tree('1 two').error).toMatch(/two/);
    expect(tree('1 2000').ok).toBe(false);
    expect(tree(Array.from({ length: 40 }, (_, i) => i).join(' ')).ok).toBe(false);
  });
});

describe('layout', () => {
  test('parents sit between children horizontally and levels are separate rows', () => {
    const t = tree(EXAMPLE_TREE);
    const lay = layoutTree(t.nodes, t.root);
    const p = Object.fromEntries(lay.positions.map((x) => [x.id, x]));
    t.nodes.forEach((n) => {
      if (n.left !== null) { expect(p[n.left].x).toBeLessThan(p[n.id].x); expect(p[n.left].y).toBeGreaterThan(p[n.id].y); }
      if (n.right !== null) { expect(p[n.right].x).toBeGreaterThan(p[n.id].x); }
    });
    expect(new Set(lay.positions.map((q) => q.x)).size).toBe(t.nodes.length); // no two nodes share a column
    expect(lay.edges).toHaveLength(t.nodes.length - 1);
  });
});

function randomTreeText() {
  const n = 1 + Math.floor(Math.random() * 15);
  const toks = [String(Math.floor(Math.random() * 50))];
  let slots = 2;
  while (toks.length < n + 3 && slots > 0) {
    const nul = Math.random() < 0.3;
    toks.push(nul ? 'null' : String(Math.floor(Math.random() * 50) - 10));
    slots += nul ? -1 : 1;
  }
  return toks.join(' ');
}

describe('traversal steps', () => {
  test.each(Object.keys(TRAVERSALS))('%s output equals the reference and every step is consistent', (kind) => {
    const known = { preorder: [1, 2, 4, 5, 3, 6], inorder: [4, 2, 5, 1, 3, 6], postorder: [4, 5, 2, 6, 3, 1], levelorder: [1, 2, 3, 4, 5, 6] };
    const t0 = tree(EXAMPLE_TREE);
    expect(traversalOutput(t0.nodes, t0.root, kind)).toEqual(known[kind]);
    let checked = 0;
    for (let i = 0; i < 80; i++) {
      const t = tree(randomTreeText());
      if (!t.ok) continue;
      checked++;
      const steps = traversalSteps(t.nodes, t.root, kind);
      const ref = traversalOutput(t.nodes, t.root, kind);
      const last = steps.at(-1);
      expect(last.type).toBe('done');
      expect(last.output).toEqual(ref);
      expect(last.visited.map((id) => t.nodes[id].value)).toEqual(ref);
      expect(last.stack).toEqual([]);
      steps.forEach((s, k) => {
        expect(TRAVERSALS[kind].java.notes[s.line], `${kind} line ${s.line} (${s.type})`).toBeTruthy();
        s.lines.forEach((l) => expect(l).toBeLessThanOrEqual(TRAVERSALS[kind].java.lines.length));
        expect(s.output.length).toBe(s.visited.length);
        if (k > 0) expect(s.visited.slice(0, steps[k - 1].visited.length)).toEqual(steps[k - 1].visited);
      });
    }
    expect(checked).toBeGreaterThan(20);
  });
  test('depth-first call stack never exceeds tree height + 1 and level-order queue holds ids', () => {
    const t = tree('1 2 3 4 null null 5 6');
    const steps = traversalSteps(t.nodes, t.root, 'preorder');
    expect(Math.max(...steps.map((s) => s.stack.length))).toBe(4);
    const q = traversalSteps(t.nodes, t.root, 'levelorder');
    expect(q.some((s) => s.stack.length > 0 && s.type === 'enqueue')).toBe(true);
  });
  test('empty tree', () => {
    for (const kind of Object.keys(TRAVERSALS)) {
      const steps = traversalSteps([], null, kind);
      expect(steps.at(-1).output).toEqual([]);
      expect(steps.at(-1).text).toMatch(/empty/);
    }
  });
  test('inorder visits a node only after its left subtree', () => {
    const t = tree('2 1 3');
    const visitIdx = traversalSteps(t.nodes, t.root, 'inorder').filter((s) => s.type === 'visit').map((s) => s.current);
    expect(visitIdx.map((id) => t.nodes[id].value)).toEqual([1, 2, 3]);
  });
});
