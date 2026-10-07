import { useId, useState } from "react";

export default function CollapsibleCard({ title, eyebrow, className, children, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();
  return (
    <section className={`${className} collapsible-card ${expanded ? "is-expanded" : ""}`}>
      <div className="section-heading collapsible-card-heading">
        <div>{eyebrow && <span className="section-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
        <button
          type="button"
          className="collapse-indicator"
          aria-expanded={expanded}
          aria-controls={contentId}
          aria-label={`${expanded ? "Minimize" : "Expand"} ${title}`}
          title={`${expanded ? "Minimize" : "Expand"} ${title}`}
          onClick={() => setExpanded((current) => !current)}
        >
          <svg className="collapse-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div id={contentId} className="collapsible-card-content" inert={!expanded} aria-hidden={!expanded}>
        <div className="collapsible-card-inner">{children}</div>
      </div>
    </section>
  );
}
