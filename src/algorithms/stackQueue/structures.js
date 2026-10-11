export const CAPACITY = 10;

const result = (state, o) => ({ state, ok: true, ...o });

/* ---------- Stack (array based, last in first out) ---------- */
export const STACK_JAVA = {
  lines: [
    'class IntStack {',
    '    private final int[] data = new int[10];',
    '    private int top = -1;',
    '',
    '    void push(int value) {',
    '        if (top == data.length - 1) throw new IllegalStateException("Stack is full");',
    '        data[++top] = value;',
    '    }',
    '    int pop() {',
    '        if (top == -1) throw new IllegalStateException("Stack is empty");',
    '        return data[top--];',
    '    }',
    '    int peek() {',
    '        if (top == -1) throw new IllegalStateException("Stack is empty");',
    '        return data[top];',
    '    }',
    '    int size() { return top + 1; }',
    '    void clear() { top = -1; }',
    '}',
  ],
  notes: {
    5: 'push adds a value on top of the stack.',
    9: 'pop removes and returns the value on top of the stack.',
    13: 'peek returns the top value without removing it.',
    17: 'size is the number of stored values: top + 1.',
    18: 'clear resets top to -1. The old values are simply ignored from then on.',
  },
};

export const stackNew = () => ({ items: [] });
export const stackVars = (s) => ({ top: s.items.length - 1, size: s.items.length });
export const stackOps = {
  push(s, value) {
    if (s.items.length >= CAPACITY) {
      return { state: s, ok: false, op: 'push', lines: [5, 6], message: `Cannot push ${value}: the stack is full (overflow). This demo holds at most ${CAPACITY} values.` };
    }
    return result({ items: [...s.items, value] }, { op: 'push', value, lines: [5, 7],
      message: `Pushed ${value}. It sits on top now, so it will be the first value to come out (last in, first out).` });
  },
  pop(s) {
    if (!s.items.length) return { state: s, ok: false, op: 'pop', lines: [9, 10], message: 'Cannot pop: the stack is empty (underflow). There is nothing to remove.' };
    const value = s.items[s.items.length - 1];
    return result({ items: s.items.slice(0, -1) }, { op: 'pop', value, lines: [9, 11],
      message: `Popped ${value} from the top. The value pushed most recently leaves first (last in, first out).` });
  },
  peek(s) {
    if (!s.items.length) return { state: s, ok: false, op: 'peek', lines: [13, 14], message: 'Cannot peek: the stack is empty, so there is no top value.' };
    const value = s.items[s.items.length - 1];
    return result(s, { op: 'peek', value, lines: [13, 15], message: `The top value is ${value}. Peek reads it without removing it, so the stack is unchanged.` });
  },
  size(s) {
    return result(s, { op: 'size', value: s.items.length, lines: [17], message: `The stack holds ${s.items.length} value${s.items.length === 1 ? '' : 's'} (top + 1 = ${s.items.length}).` });
  },
  clear(s) {
    return result({ items: [] }, { op: 'clear', lines: [18], message: s.items.length ? `Cleared ${s.items.length} value${s.items.length === 1 ? '' : 's'}. The stack is empty again.` : 'The stack was already empty.' });
  },
};

/* ---------- Queue (circular array, first in first out) ---------- */
export const QUEUE_JAVA = {
  lines: [
    'class IntQueue {',
    '    private final int[] data = new int[10];',
    '    private int front = 0, size = 0;',
    '',
    '    void enqueue(int value) {',
    '        if (size == data.length) throw new IllegalStateException("Queue is full");',
    '        data[(front + size) % data.length] = value;',
    '        size++;',
    '    }',
    '    int dequeue() {',
    '        if (size == 0) throw new IllegalStateException("Queue is empty");',
    '        int value = data[front];',
    '        front = (front + 1) % data.length;',
    '        size--;',
    '        return value;',
    '    }',
    '    int peek() {',
    '        if (size == 0) throw new IllegalStateException("Queue is empty");',
    '        return data[front];',
    '    }',
    '    int size() { return size; }',
    '    void clear() { front = 0; size = 0; }',
    '}',
  ],
  notes: {
    5: 'enqueue adds a value at the rear of the queue.',
    10: 'dequeue removes and returns the value at the front of the queue.',
    17: 'peek returns the front value without removing it.',
    21: 'size is the number of stored values.',
    22: 'clear resets front and size, so the queue is empty again.',
  },
};

export const queueNew = () => ({ items: [], front: 0 });
export const queueVars = (q) => ({ front: q.front, size: q.items.length });
export const queueOps = {
  enqueue(q, value) {
    if (q.items.length >= CAPACITY) {
      return { state: q, ok: false, op: 'enqueue', lines: [5, 6], message: `Cannot enqueue ${value}: the queue is full. This demo holds at most ${CAPACITY} values.` };
    }
    return result({ ...q, items: [...q.items, value] }, { op: 'enqueue', value, lines: [5, 7, 8],
      message: `Enqueued ${value} at the rear. It waits behind everything already in the queue (first in, first out).` });
  },
  dequeue(q) {
    if (!q.items.length) return { state: q, ok: false, op: 'dequeue', lines: [10, 11], message: 'Cannot dequeue: the queue is empty (underflow). There is nothing to remove.' };
    const value = q.items[0];
    return result({ items: q.items.slice(1), front: (q.front + 1) % CAPACITY }, { op: 'dequeue', value, lines: [10, 12, 13, 14, 15],
      message: `Dequeued ${value} from the front. The value that has waited longest leaves first (first in, first out).` });
  },
  peek(q) {
    if (!q.items.length) return { state: q, ok: false, op: 'peek', lines: [17, 18], message: 'Cannot peek: the queue is empty, so there is no front value.' };
    const value = q.items[0];
    return result(q, { op: 'peek', value, lines: [17, 19], message: `The front value is ${value}. Peek reads it without removing it, so the queue is unchanged.` });
  },
  size(q) {
    return result(q, { op: 'size', value: q.items.length, lines: [21], message: `The queue holds ${q.items.length} value${q.items.length === 1 ? '' : 's'}.` });
  },
  clear(q) {
    return result({ items: [], front: 0 }, { op: 'clear', lines: [22], message: q.items.length ? `Cleared ${q.items.length} value${q.items.length === 1 ? '' : 's'}. The queue is empty again.` : 'The queue was already empty.' });
  },
};
