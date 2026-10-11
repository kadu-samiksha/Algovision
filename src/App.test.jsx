import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';

let errorSpy;
beforeEach(() => {
  localStorage.clear();
  window.matchMedia = (query) => ({
    matches: query.includes('min-width'), media: query, addEventListener() {}, removeEventListener() {},
  });
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  expect(errorSpy).not.toHaveBeenCalled(); // no React warnings or runtime errors
  errorSpy.mockRestore();
});

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProgressProvider><App /></ProgressProvider>
    </MemoryRouter>,
  );

const useArray = (text) => {
  fireEvent.change(screen.getByPlaceholderText(/e\.g\./), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: /use this array/i }));
};
const explanation = () => document.querySelector('.explain p').textContent;

describe('AlgoVision shell', () => {
  test('home page shows the hero and navigates to the sorting visualizer', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Understand DSA. One step at a time.' })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: /explore algorithms/i }));
    expect(screen.getByRole('heading', { level: 1, name: 'Bubble Sort' })).toBeTruthy();
  });

  test('every sidebar destination is a real link and nothing is marked as unfinished', () => {
    renderAt('/');
    const nav = within(screen.getByRole('navigation', { name: 'Main' }));
    for (const name of ['Home', 'Sorting Algorithms', 'Searching Algorithms', 'Linked Lists', 'Stacks and Queues', 'Trees', 'Practice Arena', 'My Progress', 'Settings']) {
      expect(nav.getByRole('link', { name })).toBeTruthy();
    }
    expect(screen.queryByText('Soon')).toBeNull();
    expect(screen.queryByText(/not built yet/i)).toBeNull();
  });

  test('unknown routes and unknown algorithms show a not-found page', () => {
    renderAt('/sorting/bogus');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy();
    cleanup();
    renderAt('/nope');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy();
  });
});

describe('Bubble Sort page', () => {
  test('next and previous walk real execution states', () => {
    renderAt('/sorting/bubble');
    useArray('3, 1, 2');
    const next = screen.getByRole('button', { name: 'Next step' });
    const prev = screen.getByRole('button', { name: 'Previous step' });
    expect(prev.disabled).toBe(true);
    fireEvent.click(next); // pass start
    fireEvent.click(next); // compare 0,1
    expect(explanation()).toBe('Comparing the elements at indices 0 and 1: 3 and 1.');
    fireEvent.click(next); // swap
    expect(explanation()).toContain('3 is larger than 1');
    const stats = within(screen.getByRole('region', { name: 'Live statistics' }));
    expect(stats.getByText('Swaps').nextSibling.textContent).toBe('1');
    expect(stats.getByText('Comparisons').nextSibling.textContent).toBe('1');
    fireEvent.click(prev);
    expect(explanation()).toBe('Comparing the elements at indices 0 and 1: 3 and 1.');
    expect(stats.getByText('Swaps').nextSibling.textContent).toBe('0');
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(stats.getByText('Current step').nextSibling.textContent).toBe('0');
  });

  test('invalid custom input shows an error and keeps the array', () => {
    renderAt('/sorting/bubble');
    useArray('4, banana');
    expect(screen.getByRole('alert').textContent).toContain('"banana"');
    useArray('');
    expect(screen.getByRole('alert').textContent).toContain('at least one');
    useArray('5');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(explanation()).toContain('nothing to compare');
  });

  test('play locks array controls, pause unlocks them', () => {
    vi.useFakeTimers();
    try {
      renderAt('/sorting/bubble');
      fireEvent.click(screen.getByRole('button', { name: /^play/i }));
      expect(screen.getByRole('button', { name: /generate array/i }).disabled).toBe(true);
      expect(screen.getByRole('button', { name: /^pause/i }).disabled).toBe(false);
      fireEvent.click(screen.getByRole('button', { name: /^pause/i }));
      expect(screen.getByRole('button', { name: /generate array/i }).disabled).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  test('reaching the end records completion and updates progress', () => {
    renderAt('/sorting/bubble');
    useArray('3, 1, 2');
    const scrub = screen.getByRole('slider', { name: 'Jump to step' });
    fireEvent.change(scrub, { target: { value: scrub.max } });
    expect(explanation()).toContain('The array is sorted');
    const saved = JSON.parse(localStorage.getItem('algovision:v1'));
    expect(Object.keys(saved.completed)).toEqual(['sort-bubble']);
    expect(document.querySelectorAll('.code__line.is-active').length).toBeGreaterThan(0);
  });

  test('Java panel highlights the lines mapped to the current step', () => {
    renderAt('/sorting/bubble');
    useArray('2, 1');
    const next = screen.getByRole('button', { name: 'Next step' });
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next); // swap step -> lines 7-10
    const active = [...document.querySelectorAll('.code__line.is-active .code__no')].map((n) => n.textContent);
    expect(active).toEqual(['7', '8', '9', '10']);
  });
});

describe('Progress page', () => {
  test('shows saved completion status', () => {
    localStorage.setItem('algovision:v1', JSON.stringify({ version: 1, visited: { 'sort-bubble': 1 }, completed: { 'sort-bubble': 2 }, last: null, prefs: { speed: 3, displayName: '' } }));
    renderAt('/progress');
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });

  test('corrupt localStorage falls back to defaults', () => {
    localStorage.setItem('algovision:v1', '{not json');
    renderAt('/progress');
    expect(screen.getByRole('heading', { name: 'My Progress' })).toBeTruthy();
  });
});

const ROUTES = [
  '/', '/sorting/bubble', '/sorting/selection', '/sorting/insertion', '/sorting/merge', '/sorting/quick', '/sorting/heap',
  '/searching/linear', '/searching/binary', '/linked-lists', '/stacks-queues/stack', '/stacks-queues/queue',
  '/trees/preorder', '/trees/inorder', '/trees/postorder', '/trees/levelorder', '/practice', '/progress', '/settings',
];

describe('every route renders', () => {
  test.each(ROUTES)('%s', (path) => {
    renderAt(path);
    expect(screen.getAllByRole('heading', { level: 1 }).length).toBe(1);
    expect(screen.queryByRole('heading', { name: 'Page not found' })).toBeNull();
  });
  test('index redirects land on a working visualizer', () => {
    for (const [from, title] of [['/sorting', 'Bubble Sort'], ['/searching', 'Linear Search'], ['/stacks-queues', 'Stacks and Queues'], ['/trees', 'Preorder Traversal']]) {
      renderAt(from);
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy();
      cleanup();
    }
  });
});

describe('all six sorts run to completion in the UI', () => {
  test.each(['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'])('%s', (slug) => {
    renderAt(`/sorting/${slug}`);
    useArray('5, 2, 9, 1, 5, 6, -3');
    const scrub = screen.getByRole('slider', { name: 'Jump to step' });
    fireEvent.change(scrub, { target: { value: scrub.max } });
    expect(explanation()).toContain('The array is sorted');
    const bars = [...document.querySelectorAll('.bar__value')].map((n) => Number(n.textContent));
    expect(bars).toEqual([-3, 1, 2, 5, 5, 6, 9]);
    expect(document.querySelectorAll('.code__line.is-active').length).toBeGreaterThan(0);
    fireEvent.change(scrub, { target: { value: '1' } }); // stepping back works for every algorithm
    expect(explanation()).not.toContain('The array is sorted');
  });
  test('merge sort shows its buffer while merging', () => {
    renderAt('/sorting/merge');
    useArray('3, 1, 2');
    const next = screen.getByRole('button', { name: 'Next step' });
    for (let i = 0; i < 4; i++) fireEvent.click(next);
    expect(document.querySelector('.chart__aux')).toBeTruthy();
  });
});

describe('searching page', () => {
  test('binary search refuses an unsorted array until the user sorts it', () => {
    renderAt('/searching/binary');
    useArray('9, 3, 7, 1');
    expect(screen.getByRole('alert').textContent).toMatch(/sorted/);
    expect(screen.getByRole('button', { name: /^play/i }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /sort the array/i }));
    expect(screen.queryByText(/only works on a sorted array/)).toBeNull();
    expect(screen.getByRole('button', { name: /^play/i }).disabled).toBe(false);
  });
  test('found and not-found results are reported', () => {
    renderAt('/searching/linear');
    useArray('4, 8, 15, 16');
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '15' } });
    const scrub = screen.getByRole('slider', { name: 'Jump to step' });
    fireEvent.change(scrub, { target: { value: scrub.max } });
    expect(document.querySelector('.result').textContent).toContain('Found 15 at index 2');
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '99' } });
    const scrub2 = screen.getByRole('slider', { name: 'Jump to step' });
    fireEvent.change(scrub2, { target: { value: scrub2.max } });
    expect(document.querySelector('.result').textContent).toContain('not in the array');
  });
  test('invalid target is explained', () => {
    renderAt('/searching/linear');
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: 'abc' } });
    expect(screen.getByRole('alert').textContent).toContain('"abc"');
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '' } });
    expect(screen.getByRole('alert').textContent).toMatch(/Enter a target/);
  });
});

describe('stack and queue page', () => {
  const type = (v) => fireEvent.change(screen.getByPlaceholderText('e.g. 42'), { target: { value: v } });
  test('stack is LIFO and rejects pop on empty', () => {
    renderAt('/stacks-queues/stack');
    fireEvent.click(screen.getByRole('button', { name: /^pop/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/underflow/);
    type('5'); fireEvent.click(screen.getByRole('button', { name: /^push/i }));
    type('7'); fireEvent.click(screen.getByRole('button', { name: /^push/i }));
    expect(screen.getByLabelText(/Stack, bottom to top: 5, 7/)).toBeTruthy();
    expect(screen.getByText('TOP')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^pop/i }));
    expect(document.querySelector('.result').textContent).toContain('Popped 7');
    expect(screen.getByLabelText(/Stack, bottom to top: 5$/)).toBeTruthy();
  });
  test('queue is FIFO with FRONT and REAR labels', () => {
    renderAt('/stacks-queues/queue');
    type('1'); fireEvent.click(screen.getByRole('button', { name: /enqueue/i }));
    type('2'); fireEvent.click(screen.getByRole('button', { name: /enqueue/i }));
    expect(screen.getByText('FRONT')).toBeTruthy();
    expect(screen.getByText('REAR')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /dequeue/i }));
    expect(document.querySelector('.result').textContent).toContain('Dequeued 1');
    expect(screen.getByLabelText(/Queue, front to rear: 2$/)).toBeTruthy();
  });
  test('invalid values are rejected with a message', () => {
    renderAt('/stacks-queues/stack');
    type('x'); fireEvent.click(screen.getByRole('button', { name: /^push/i }));
    expect(screen.getByRole('alert').textContent).toContain('"x"');
  });
});

describe('linked list page', () => {
  const val = (v) => fireEvent.change(screen.getByPlaceholderText('e.g. 42'), { target: { value: v } });
  const toEnd = () => { const s = screen.getByRole('slider', { name: 'Jump to step' }); fireEvent.change(s, { target: { value: s.max } }); };
  test('insert at end then delete changes the drawn chain', () => {
    renderAt('/linked-lists');
    expect(screen.getByRole('img', { name: 'Linked list: HEAD, 12, 7, 30, NULL' })).toBeTruthy();
    val('9'); fireEvent.click(screen.getByRole('button', { name: /insert at end/i })); toEnd();
    expect(screen.getByRole('img', { name: 'Linked list: HEAD, 12, 7, 30, 9, NULL' })).toBeTruthy();
    val('7'); fireEvent.click(screen.getByRole('button', { name: /delete by value/i })); toEnd();
    expect(screen.getByRole('img', { name: 'Linked list: HEAD, 12, 30, 9, NULL' })).toBeTruthy();
    expect(screen.getByText(/time complexity/i)).toBeTruthy();
  });
  test('invalid positions and values are explained', () => {
    renderAt('/linked-lists');
    val('5');
    fireEvent.change(screen.getByPlaceholderText('e.g. 2'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: /insert at position/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/not valid/);
    val('');
    fireEvent.click(screen.getByRole('button', { name: /insert at beginning/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/Enter a value/);
  });
  test('traverse shows the output', () => {
    renderAt('/linked-lists');
    fireEvent.click(screen.getByRole('button', { name: /traverse/i })); toEnd();
    expect(screen.getByText('12 → 7 → 30')).toBeTruthy();
  });
});

describe('tree page', () => {
  const toEnd = () => { const s = screen.getByRole('slider', { name: 'Jump to step' }); fireEvent.change(s, { target: { value: s.max } }); };
  const build = (t) => { fireEvent.change(screen.getByPlaceholderText(/e\.g\./), { target: { value: t } }); fireEvent.click(screen.getByRole('button', { name: /build tree/i })); };
  test('inorder output of a small tree', () => {
    renderAt('/trees/inorder');
    build('2 1 3'); toEnd();
    expect([...document.querySelectorAll('.out-list[aria-label="Output so far"] li')].map((n) => n.textContent)).toEqual(['1', '2', '3']);
  });
  test('level-order shows the queue and the same tree gives different orders per tab', () => {
    renderAt('/trees/levelorder');
    build('1 2 3 4'); 
    const next = screen.getByRole('button', { name: 'Next step' });
    for (let i = 0; i < 3; i++) fireEvent.click(next);
    expect(screen.getByRole('heading', { name: /Queue/ })).toBeTruthy();
    toEnd();
    expect([...document.querySelectorAll('.out-list[aria-label="Output so far"] li')].map((n) => n.textContent)).toEqual(['1', '2', '3', '4']);
  });
  test('invalid, orphaned and empty input are handled', () => {
    renderAt('/trees/preorder');
    build('1 two');
    expect(screen.getByRole('alert').textContent).toContain('two');
    build('1 null null 5');
    expect(screen.getByRole('alert').textContent).toMatch(/no parent/);
    build('');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getAllByText(/tree is empty/i).length).toBeGreaterThan(0);
    toEnd();
    expect(screen.getByText(/output is empty/i)).toBeTruthy();
  });
});

describe('practice arena', () => {
  test('answering gives feedback, is recorded, and the next question differs', () => {
    renderAt('/practice');
    const firstPrompt = screen.getByRole('heading', { level: 2 }).textContent;
    const options = screen.getAllByRole('button', { pressed: false }).filter((b) => b.classList.contains('option'));
    expect(options).toHaveLength(4);
    fireEvent.click(options[0]);
    const fb = document.querySelector('.feedback');
    expect(fb.textContent).toMatch(/Correct|Not quite/);
    expect(fb.textContent.length).toBeGreaterThan(30);
    const saved = JSON.parse(localStorage.getItem('algovision:v1'));
    expect(Object.values(saved.practice)[0].attempts).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: /next question/i }));
    expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(firstPrompt);
  });
  test('topic filter limits the pool', () => {
    renderAt('/practice');
    fireEvent.change(screen.getByLabelText('Topic'), { target: { value: 'trees' } });
    expect(screen.getByText(/questions seen in this selection/).textContent).toMatch(/of 1\d/);
  });
  test('answers are counted on the home page', () => {
    renderAt('/practice');
    fireEvent.click(document.querySelector('.option'));
    cleanup();
    renderAt('/');
    expect(screen.getByText('Practice answered').nextSibling.textContent).toMatch(/^1/);
  });
});
