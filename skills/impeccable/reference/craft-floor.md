# Craft floor

Load this after direction and scope are settled. This file verifies technical
quality; it does not choose or veto aesthetic direction. The user brief,
DESIGN.md, and approved `frontend-design` contract own taste.

## Verify the built result

- **Contrast:** body and placeholder text reach 4.5:1; large text, controls,
  icons, and focus indicators reach 3:1 where WCAG AA requires it. Information
  is not encoded by color alone.
- **Semantics:** landmarks, headings, controls, labels, names, announcements,
  and DOM order match the interface's meaning and behavior.
- **Keyboard and input:** focus is visible, order is logical, controls are
  operable without a pointer, touch targets are usable, and no interaction
  depends only on hover.
- **States:** default, hover, focus, active, disabled, loading, empty, error,
  success, permissions, overflow, and destructive paths are covered when the
  component can enter them.
- **Responsive behavior:** real copy, long words, localization expansion, zoom,
  narrow containers, safe areas, and intermediate widths do not overflow or
  destroy hierarchy.
- **Typography delivery:** required weights load, fallbacks avoid disruptive
  reflow, text remains zoomable, and body measure stays readable.
- **Motion:** content is visible before enhancement; animation is interruptible
  where needed, reduced motion is respected, and expensive work stays bounded.
- **Assets:** paths resolve, dimensions and formats are appropriate, alt text
  carries the intended information, and below-fold media is loaded responsibly.
- **Performance:** avoidable layout shift, main-thread blocking, duplicate
  dependencies, unbounded effects, and console errors are absent.
- **Behavior:** controls work, state persists or resets as intended, errors name
  recovery, and factual content remains true.
- **Maintainability:** implementation follows project boundaries, reuses stable
  local patterns, and avoids one-off overrides that hide contract drift.
- **Coverage:** every user requirement and every creative-contract element is
  present or documented as an accepted deviation.

## Resolve conflicts

Mechanical findings are defects when they violate correctness, accessibility,
the user request, or the approved contract. A detector's aesthetic heuristic is
evidence for `frontend-design`, not authority to override the contract.

If a technical requirement blocks a creative choice, identify the exact
constraint and return that decision once through
[creative-handoff.md](creative-handoff.md). Among technically valid options,
preserve `frontend-design`'s choice.

## Finish

Run the narrowest relevant build, detector, browser, and state checks. Inspect
the rendered result rather than trusting source or a clean scan alone. Report
what was verified, what could not be verified, and any accepted deviation.
