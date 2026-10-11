import { describe, expect, test } from 'vitest';
import { CAPACITY, queueNew, queueOps, queueVars, stackNew, stackOps, stackVars, STACK_JAVA, QUEUE_JAVA } from './structures.js';

describe('stack', () => {
  test('is last in, first out', () => {
    let s = stackNew();
    [1, 2, 3].forEach((v) => { s = stackOps.push(s, v).state; });
    const r = stackOps.pop(s);
    expect(r.value).toBe(3);
    expect(r.state.items).toEqual([1, 2]);
    expect(stackOps.peek(r.state).value).toBe(2);
    expect(stackVars(r.state)).toEqual({ top: 1, size: 2 });
  });
  test('empty and full are handled with explanations', () => {
    const empty = stackNew();
    for (const op of ['pop', 'peek']) {
      const r = stackOps[op](empty);
      expect(r.ok).toBe(false);
      expect(r.state).toBe(empty);
      expect(r.message).toMatch(/empty/);
    }
    let s = stackNew();
    for (let i = 0; i < CAPACITY; i++) s = stackOps.push(s, i).state;
    const full = stackOps.push(s, 99);
    expect(full.ok).toBe(false);
    expect(full.state.items).toHaveLength(CAPACITY);
    expect(stackOps.clear(s).state.items).toEqual([]);
  });
  test('peek does not change the stack; every op maps to existing Java lines with notes', () => {
    const s = stackOps.push(stackNew(), 5).state;
    expect(stackOps.peek(s).state.items).toEqual([5]);
    for (const r of [stackOps.push(s, 1), stackOps.pop(s), stackOps.peek(s), stackOps.size(s), stackOps.clear(s), stackOps.pop(stackNew())]) {
      r.lines.forEach((l) => expect(l).toBeLessThanOrEqual(STACK_JAVA.lines.length));
      expect(STACK_JAVA.notes[r.lines[0]]).toBeTruthy();
    }
  });
});

describe('queue', () => {
  test('is first in, first out and tracks front', () => {
    let q = queueNew();
    [1, 2, 3].forEach((v) => { q = queueOps.enqueue(q, v).state; });
    const r = queueOps.dequeue(q);
    expect(r.value).toBe(1);
    expect(r.state.items).toEqual([2, 3]);
    expect(queueVars(r.state)).toEqual({ front: 1, size: 2 });
    expect(queueOps.peek(r.state).value).toBe(2);
  });
  test('empty and full are handled', () => {
    const empty = queueNew();
    expect(queueOps.dequeue(empty).ok).toBe(false);
    expect(queueOps.peek(empty).message).toMatch(/empty/);
    let q = queueNew();
    for (let i = 0; i < CAPACITY; i++) q = queueOps.enqueue(q, i).state;
    expect(queueOps.enqueue(q, 1).ok).toBe(false);
    expect(queueOps.clear(q).state).toEqual({ items: [], front: 0 });
  });
  test('Java line metadata is valid', () => {
    const q = queueOps.enqueue(queueNew(), 5).state;
    for (const r of [queueOps.enqueue(q, 1), queueOps.dequeue(q), queueOps.peek(q), queueOps.size(q), queueOps.clear(q), queueOps.dequeue(queueNew())]) {
      r.lines.forEach((l) => expect(l).toBeLessThanOrEqual(QUEUE_JAVA.lines.length));
      expect(QUEUE_JAVA.notes[r.lines[0]]).toBeTruthy();
    }
  });
});
