import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { usePlayback } from './usePlayback.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const setup = (props = {}) =>
  renderHook((p) => usePlayback(p.n, p.speed, p.key), { initialProps: { n: 5, speed: 100, key: 'a', ...props } });
// Advance in small slices so React can re-render (and schedule the next timeout) between ticks.
const tick = (ms) => {
  for (let t = 0; t < ms; t += 10) act(() => vi.advanceTimersByTime(10));
};

describe('usePlayback', () => {
  test('plays at the chosen speed and stops on the last step', () => {
    const { result } = setup();
    act(() => result.current.play());
    expect(result.current.playing).toBe(true);
    tick(100);
    expect(result.current.index).toBe(1);
    tick(300);
    expect(result.current.index).toBe(4);
    expect(result.current.playing).toBe(false);
    expect(result.current.atEnd).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('pause stops advancing and play resumes from the same step', () => {
    const { result } = setup();
    act(() => result.current.play());
    tick(200);
    act(() => result.current.pause());
    tick(1000);
    expect(result.current.index).toBe(2);
    act(() => result.current.play());
    tick(100);
    expect(result.current.index).toBe(3);
  });

  test('next and previous move one step, clamp, and pause playback', () => {
    const { result } = setup();
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
    act(() => result.current.play());
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    expect(result.current.playing).toBe(false);
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
    for (let i = 0; i < 10; i++) act(() => result.current.next());
    expect(result.current.index).toBe(4);
  });

  test('reset rewinds and clears the timer', () => {
    const { result } = setup();
    act(() => result.current.play());
    tick(250);
    act(() => result.current.reset());
    expect(result.current.index).toBe(0);
    expect(result.current.playing).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('changing speed mid-play never runs two timers', () => {
    const { result, rerender } = setup();
    act(() => result.current.play());
    rerender({ n: 5, speed: 50, key: 'a' });
    expect(vi.getTimerCount()).toBe(1);
    tick(50);
    expect(result.current.index).toBe(1);
    tick(50);
    expect(result.current.index).toBe(2);
  });

  test('changing the steps stops playback and rewinds', () => {
    const { result, rerender } = setup();
    act(() => result.current.play());
    tick(200);
    rerender({ n: 8, speed: 100, key: 'b' });
    expect(result.current.index).toBe(0);
    expect(result.current.playing).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('play at the end starts over; seek clamps and pauses', () => {
    const { result } = setup();
    act(() => result.current.seek(99));
    expect(result.current.index).toBe(4);
    act(() => result.current.play());
    expect(result.current.index).toBe(0);
    act(() => result.current.seek(-5));
    expect(result.current.index).toBe(0);
    expect(result.current.playing).toBe(false);
  });

  test('unmounting clears the timer', () => {
    const { result, unmount } = setup();
    act(() => result.current.play());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
