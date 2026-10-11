const KEY = 'algovision:v1';
const VERSION = 1;

export const defaultState = () => ({
  version: VERSION,
  visited: {}, // topicId -> first visit timestamp
  completed: {}, // topicId -> first completion timestamp
  last: null, // { id, at }
  practice: {}, // questionId -> { attempts, correct, lastAt }
  prefs: { speed: 3, displayName: '' },
});

const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const timestamps = (o) =>
  isObj(o) ? Object.fromEntries(Object.entries(o).filter(([, v]) => Number.isFinite(v))) : {};

/** Accepts anything and returns a valid state. Unknown, outdated or corrupt data falls back to defaults. */
export function sanitize(raw) {
  const state = defaultState();
  if (!isObj(raw) || raw.version !== VERSION) return state;
  state.visited = timestamps(raw.visited);
  state.completed = timestamps(raw.completed);
  if (isObj(raw.practice)) {
    for (const [id, p] of Object.entries(raw.practice)) {
      if (isObj(p) && Number.isInteger(p.attempts) && p.attempts > 0 && Number.isInteger(p.correct) && p.correct >= 0 && p.correct <= p.attempts && Number.isFinite(p.lastAt)) {
        state.practice[id] = { attempts: p.attempts, correct: p.correct, lastAt: p.lastAt };
      }
    }
  }
  if (isObj(raw.last) && typeof raw.last.id === 'string' && Number.isFinite(raw.last.at)) {
    state.last = { id: raw.last.id, at: raw.last.at };
  }
  if (isObj(raw.prefs)) {
    const { speed, displayName } = raw.prefs;
    if (Number.isInteger(speed) && speed >= 1 && speed <= 5) state.prefs.speed = speed;
    if (typeof displayName === 'string') state.prefs.displayName = displayName.slice(0, 40);
  }
  return state;
}

export function loadState() {
  try {
    const text = localStorage.getItem(KEY);
    return text ? sanitize(JSON.parse(text)) : defaultState();
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be full or blocked; the app keeps working without persistence */
  }
}
