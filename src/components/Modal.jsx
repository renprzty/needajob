import { createPortal } from "react-dom";

function Modal({ children, onClose, className = "" }) {
  const modalContent = (
    <div className={`modal-overlay ${className}`} onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        {onClose && (
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        )}

        {children}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

export default Modal;
