import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/** Accessible modal built on the native <dialog>: focus trap, Esc to close and focus return come for free. */
export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="modal__body">
          <div className="modal__head">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Close dialog">
              <X />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
