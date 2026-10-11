import Modal from './Modal.jsx';

const SHORTCUTS = [
  ['Space', 'Play or pause'],
  ['→', 'Next step'],
  ['←', 'Previous step'],
  ['R', 'Reset to the first step'],
  ['G', 'Generate a new array'],
];

export default function ShortcutsModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <ul className="shortcuts">
        {SHORTCUTS.map(([key, action]) => (
          <li key={key}>
            <span>{action}</span>
            <kbd>{key}</kbd>
          </li>
        ))}
      </ul>
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        Shortcuts work on visualizer pages and are paused while you type in a field.
      </p>
    </Modal>
  );
}
