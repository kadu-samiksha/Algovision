import { describe, expect, test } from 'vitest';
import { JAVA, MAX_NODES, clearList, deleteValue, insertAt, insertHead, insertTail, searchValue, traverseList } from './operations.js';

const mk = (...values) => values.map((value, i) => ({ id: i + 1, value }));
const vs = (nodes) => nodes.map((n) => n.value);

function checkSteps(res, before) {
  expect(res.ok).toBe(true);
  const { steps } = res;
  expect(steps[0].type).toBe('start');
  expect(vs(steps[0].nodes)).toEqual(vs(before));
  steps.forEach((s) => {
    s.lines.forEach((l) => expect(l).toBeLessThanOrEqual(JAVA.lines.length));
    expect(JAVA.notes[s.line], `line ${s.line} (${s.type})`).toBeTruthy();
    expect(s.text.length).toBeGreaterThan(0);
    const ids = s.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  expect(vs(steps.at(-1).nodes)).toEqual(vs(res.nodes));
}

describe('linked list operations', () => {
  test('insert at head', () => {
    const before = mk(3, 5);
    const r = insertHead(before, 9, 99);
    checkSteps(r, before);
    expect(vs(r.nodes)).toEqual([9, 3, 5]);
    expect(r.steps.find((s) => s.type === 'link').floating.next).toBe(3);
    expect(vs(insertHead([], 1, 1).nodes)).toEqual([1]);
  });
  test('insert at tail, including empty list', () => {
    const before = mk(3, 5);
    const r = insertTail(before, 9, 99);
    checkSteps(r, before);
    expect(vs(r.nodes)).toEqual([3, 5, 9]);
    checkSteps(insertTail([], 4, 1), []);
    expect(vs(insertTail([], 4, 1).nodes)).toEqual([4]);
  });
  test('insert at every valid position and reject invalid ones', () => {
    const before = mk(1, 2, 3);
    for (let pos = 0; pos <= 3; pos++) {
      const r = insertAt(before, pos, 7, 50);
      checkSteps(r, before);
      const expected = vs(before);
      expected.splice(pos, 0, 7);
      expect(vs(r.nodes)).toEqual(expected);
    }
    for (const bad of [-1, 4, 1.5, NaN]) expect(insertAt(before, bad, 7, 50).ok).toBe(false);
    expect(insertAt([], 0, 7, 1).ok).toBe(true);
    expect(insertAt([], 1, 7, 1).ok).toBe(false);
  });
  test('delete head, middle, tail, missing, duplicates and empty', () => {
    const before = mk(1, 2, 3, 2);
    for (const [v, expected] of [[1, [2, 3, 2]], [3, [1, 2, 2]], [2, [1, 3, 2]], [9, [1, 2, 3, 2]]]) {
      const r = deleteValue(before, v);
      checkSteps(r, before);
      expect(vs(r.nodes)).toEqual(expected);
      expect(r.changed).toBe(expected.length !== 4);
    }
    const mid = deleteValue(before, 3);
    expect(mid.steps.some((s) => s.bypass !== null)).toBe(true);
    const e = deleteValue([], 1);
    checkSteps(e, []);
    expect(e.changed).toBe(false);
    expect(e.steps.at(-1).text).toMatch(/empty/);
  });
  test('search returns the first index or -1', () => {
    const before = mk(4, 7, 7);
    expect(searchValue(before, 7).index).toBe(1);
    expect(searchValue(before, 1).index).toBe(-1);
    expect(searchValue([], 1).index).toBe(-1);
    checkSteps(searchValue(before, 7), before);
    expect(searchValue(before, 7).steps.at(-1).found).toBe(2 - 1 + 1 === 2 ? before[1].id : null);
  });
  test('traverse outputs every value in order; clear empties the list', () => {
    const before = mk(5, 6, 7);
    const t = traverseList(before);
    checkSteps(t, before);
    expect(t.output).toEqual([5, 6, 7]);
    expect(t.steps.at(-1).output).toEqual([5, 6, 7]);
    expect(traverseList([]).output).toEqual([]);
    const c = clearList(before);
    checkSteps(c, before);
    expect(c.nodes).toEqual([]);
  });
  test('list size is capped', () => {
    const full = mk(...Array.from({ length: MAX_NODES }, (_, i) => i));
    for (const r of [insertHead(full, 1, 99), insertTail(full, 1, 99), insertAt(full, 2, 1, 99)]) {
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/full/);
    }
  });
  test('random operation sequences match a plain array model', () => {
    let nodes = [];
    let model = [];
    let id = 1;
    for (let t = 0; t < 300; t++) {
      const v = Math.floor(Math.random() * 6);
      const k = Math.floor(Math.random() * 4);
      let r;
      if (k === 0) { r = insertHead(nodes, v, id++); if (r.ok) model.unshift(v); }
      else if (k === 1) { r = insertTail(nodes, v, id++); if (r.ok) model.push(v); }
      else if (k === 2) { const pos = Math.floor(Math.random() * (model.length + 1)); r = insertAt(nodes, pos, v, id++); if (r.ok) model.splice(pos, 0, v); }
      else { r = deleteValue(nodes, v); const i = model.indexOf(v); if (i >= 0) model.splice(i, 1); }
      if (r.ok) nodes = r.nodes;
      expect(vs(nodes)).toEqual(model);
    }
  });
});
