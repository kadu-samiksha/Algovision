import { describe, expect, test } from 'vitest';
import { parseArrayInput } from './validation.js';
import { sanitize, defaultState } from './storage.js';
import { barHeightPercent } from './arrays.js';

describe('parseArrayInput', () => {
  test('accepts commas, spaces, negatives and duplicates', () => {
    expect(parseArrayInput('5, 3 -2;3').values).toEqual([5, 3, -2, 3]);
    expect(parseArrayInput('7').values).toEqual([7]);
  });
  test('rejects empty, non-numeric, decimals, too many, out of range', () => {
    expect(parseArrayInput('   ').ok).toBe(false);
    expect(parseArrayInput('1, two').error).toContain('"two"');
    expect(parseArrayInput('1.5').ok).toBe(false);
    expect(parseArrayInput(Array(41).fill(1).join(',')).ok).toBe(false);
    expect(parseArrayInput('1000').ok).toBe(false);
  });
});

describe('storage.sanitize', () => {
  test('falls back to defaults for bad or outdated data', () => {
    expect(sanitize(null)).toEqual(defaultState());
    expect(sanitize('x')).toEqual(defaultState());
    expect(sanitize({ version: 0, visited: { a: 1 } })).toEqual(defaultState());
  });
  test('keeps valid fields and drops invalid ones', () => {
    const s = sanitize({ version: 1, visited: { a: 5, b: 'no' }, completed: [], last: { id: 'a', at: 5 }, prefs: { speed: 9, displayName: 'Teri' } });
    expect(s.visited).toEqual({ a: 5 });
    expect(s.completed).toEqual({});
    expect(s.last).toEqual({ id: 'a', at: 5 });
    expect(s.prefs).toEqual({ speed: 3, displayName: 'Teri' });
  });
});

describe('barHeightPercent', () => {
  test('is proportional for non-negative values and keeps negatives visible', () => {
    expect(barHeightPercent(50, 10, 100)).toBe(50);
    expect(barHeightPercent(100, 10, 100)).toBe(100);
    expect(barHeightPercent(-5, -5, 5)).toBeGreaterThan(0);
    expect(barHeightPercent(4, 4, 4)).toBe(60);
  });
});
