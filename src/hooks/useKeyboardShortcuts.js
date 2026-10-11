import { useEffect, useRef } from 'react';

/** handlers: { Space, ArrowRight, ArrowLeft, r, g, ... }. Ignored while typing or when a dialog is open. */
export function useKeyboardShortcuts(handlers, enabled = true) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
      if (e.key === ' ' && tag === 'BUTTON') return; // let the focused button handle Space itself
      if (document.querySelector('dialog[open]')) return;
      const name = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const fn = ref.current[name];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
