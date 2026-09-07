"use client";

import { useId, useState } from "react";

/**
 * Accessible info icon + tooltip. Works via CSS :hover/:focus-within for
 * mouse/keyboard users, and via click/tap (React state) for touch devices
 * where hover never fires — required so the info is never hover-only.
 */
export function InfoTooltip({ text, subjectLabel }: { text: string; subjectLabel: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="protector-risk-factor-info" data-open={open ? "true" : undefined}>
      <button
        type="button"
        className="protector-risk-factor-info-trigger"
        aria-label={`Más información sobre: ${subjectLabel}`}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => setOpen(false)}
      >
        <span aria-hidden="true">ⓘ</span>
      </button>
      <span role="tooltip" id={tooltipId} className="protector-risk-factor-info-bubble">{text}</span>
    </span>
  );
}
