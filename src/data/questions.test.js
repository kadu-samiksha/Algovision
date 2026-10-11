import { describe, expect, test } from 'vitest';
import { PRACTICE_TOPICS, QUESTIONS, QUESTION_TYPES, pickNext } from './questions.js';
import { stackNew, stackOps } from '../algorithms/stackQueue/structures.js';

describe('question bank', () => {
  test('ids are unique and every question is well formed', () => {
    expect(new Set(QUESTIONS.map((x) => x.id)).size).toBe(QUESTIONS.length);
    QUESTIONS.forEach((x) => {
      expect(PRACTICE_TOPICS.map((t) => t.id)).toContain(x.topic);
      expect(Object.keys(QUESTION_TYPES)).toContain(x.type);
      expect(x.options.length).toBe(4);
      expect(new Set(x.options).size).toBe(4); // distinct options
      expect(x.correct).toBeGreaterThanOrEqual(0);
      expect(x.correct).toBeLessThan(4);
      expect(x.explanation.length).toBeGreaterThan(10);
      expect(x.prompt.length).toBeGreaterThan(10);
    });
  });
  test('every topic and every required question type is covered', () => {
    PRACTICE_TOPICS.forEach((t) => expect(QUESTIONS.filter((x) => x.topic === t.id).length).toBeGreaterThanOrEqual(6));
    Object.keys(QUESTION_TYPES).forEach((type) => expect(QUESTIONS.some((x) => x.type === type)).toBe(true));
  });
  test('the bank is deterministic', async () => {
    const again = (await import('./questions.js')).QUESTIONS;
    expect(again.map((x) => [x.id, x.correct])).toEqual(QUESTIONS.map((x) => [x.id, x.correct]));
  });
  test('computed answers match the real implementations', () => {
    const find = (id) => QUESTIONS.find((x) => x.id === id);
    const sq3 = find('sq-3');
    expect(sq3.options[sq3.correct]).toBe('4, 2');
    const sq4 = find('sq-4');
    expect(sq4.options[sq4.correct]).toBe('8, 1');
    const ll3 = find('ll-3');
    expect(ll3.options[ll3.correct]).toBe('3 → 5 → 7 → 8');
    const tree = find('tree-c');
    expect(tree.options[tree.correct]).toBe('1, 3, 6, 8, 10, 14');
    expect(stackOps.pop({ items: [2, 5, 9] }).value).toBe(9);
    expect(stackOps.push(stackNew(), 1).ok).toBe(true);
  });
  test('wrong options never equal the right one (answer text appears once)', () => {
    QUESTIONS.forEach((x) => expect(x.options.filter((o) => o === x.options[x.correct]).length).toBe(1));
  });
});

describe('pickNext', () => {
  const pool = QUESTIONS.slice(0, 3);
  test('serves unattempted questions first and never repeats the current one', () => {
    expect(pickNext(pool, {}, null).id).toBe(pool[0].id);
    expect(pickNext(pool, { [pool[0].id]: { attempts: 1, correct: 1, lastAt: 5 } }, pool[0].id).id).toBe(pool[1].id);
  });
  test('after all are attempted it returns the least recently attempted', () => {
    const practice = Object.fromEntries(pool.map((x, i) => [x.id, { attempts: 1, correct: 0, lastAt: 100 - i }]));
    expect(pickNext(pool, practice, null).id).toBe(pool[2].id);
    expect(pickNext(pool, practice, pool[2].id).id).toBe(pool[1].id);
  });
  test('works with a single-question pool', () => {
    expect(pickNext([pool[0]], {}, pool[0].id).id).toBe(pool[0].id);
    expect(pickNext([], {}, null)).toBeNull();
  });
});
