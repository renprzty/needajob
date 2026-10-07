import { useEffect, useRef } from "react";
import Modal from "./Modal";

export default function PrototypeBetaNotice({ onDismiss }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    buttonRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") onDismiss();
      if (event.key === "Tab") {
        const controls = buttonRef.current?.closest(".modal")?.querySelectorAll("button");
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onDismiss]);

  return (
    <Modal onClose={onDismiss} className="prototype-beta-overlay">
      <div role="dialog" aria-modal="true" aria-labelledby="prototype-beta-title" aria-describedby="prototype-beta-description">
        <h2 id="prototype-beta-title">Prototype Beta</h2>
        <p id="prototype-beta-description">
          NeedaJob is currently being tested. Features may change and occasional bugs may occur. Avoid uploading highly sensitive documents or information during this testing period.
        </p>
        <button ref={buttonRef} type="button" className="primary-button" onClick={onDismiss}>Got it</button>
      </div>
    </Modal>
  );
}
