import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState, defaultState } from '../utils/storage.js';
import { AVAILABLE_TOPICS } from '../data/catalog.js';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const markVisited = useCallback((id) => {
    setState((s) => ({
      ...s,
      visited: s.visited[id] ? s.visited : { ...s.visited, [id]: Date.now() },
      last: { id, at: Date.now() },
    }));
  }, []);

  const markCompleted = useCallback((id) => {
    setState((s) => (s.completed[id] ? s : { ...s, completed: { ...s.completed, [id]: Date.now() } }));
  }, []);

  const recordAnswer = useCallback((id, isCorrect) => {
    setState((s) => {
      const prev = s.practice[id] ?? { attempts: 0, correct: 0, lastAt: 0 };
      return { ...s, practice: { ...s.practice, [id]: { attempts: prev.attempts + 1, correct: prev.correct + (isCorrect ? 1 : 0), lastAt: Date.now() } } };
    });
  }, []);

  const setPref = useCallback((key, value) => {
    setState((s) => ({ ...s, prefs: { ...s.prefs, [key]: value } }));
  }, []);

  // Clears learning progress but keeps preferences.
  const resetProgress = useCallback(() => {
    setState((s) => ({ ...defaultState(), prefs: s.prefs }));
  }, []);

  const stats = useMemo(() => {
    const ids = new Set(AVAILABLE_TOPICS.map((t) => t.id));
    const visited = Object.keys(state.visited).filter((id) => ids.has(id)).length;
    const completed = Object.keys(state.completed).filter((id) => ids.has(id)).length;
    const available = AVAILABLE_TOPICS.length;
    const answers = Object.values(state.practice);
    const answered = answers.reduce((n, p) => n + p.attempts, 0);
    const correct = answers.reduce((n, p) => n + p.correct, 0);
    return { visited, completed, available, answered, correct, percent: available ? Math.round((completed / available) * 100) : 0 };
  }, [state]);

  const value = useMemo(
    () => ({ state, stats, markVisited, markCompleted, recordAnswer, setPref, resetProgress }),
    [state, stats, markVisited, markCompleted, recordAnswer, setPref, resetProgress],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}

export function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'G';
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}
