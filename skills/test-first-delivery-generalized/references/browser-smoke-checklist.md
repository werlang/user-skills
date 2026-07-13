# Browser Smoke Test Checklist

Use this checklist to manually verify frontend changes in a browser.

## 1. Interaction & State Integrity

- [ ] **Happy Path Validation**: Verify that the primary user flow works end-to-end (e.g., submitting a form, clicking a link, loading a view).
- [ ] **Input Handling**: Test with boundary inputs (extremely long names, special characters, empty values).
- [ ] **Validation States**: Ensure inline errors trigger appropriately and prevent invalid form submission.
- [ ] **Busy & Pending States**: Verify that loading spinners appear, submit buttons are disabled during execution, and no double-clicks trigger repeated API requests.
- [ ] **Error Handling**: Simulate a network failure or server error to ensure the application fails gracefully, showing a useful message instead of crashing or freezing.

## 2. UI Layout & Accessibility

- [ ] **Responsive Design**: Test the layout at different viewport sizes (Mobile, Tablet, Desktop). Check for clipping text or broken grids.
- [ ] **Keyboard Navigation**: Verify that all interactive elements can be focused using the `Tab` key and activated with `Enter` or `Space`.
- [ ] **Focus Management**: Check that focus states are visible and return to a logical element after closing a modal, dialog, or popover.
- [ ] **Contrast & Zoom**: Verify text is readable under standard settings.

## 3. Console & Network Diagnostics

- [ ] **Clean Developer Console**: Open browser dev tools and confirm no new `uncaught exceptions`, `warning` messages, or `failed resources` appear during interactions.
- [ ] **Network Requests**: Inspect the Network tab to confirm:
  - Correct HTTP headers are sent (specifically authorization headers, cookies).
  - Payloads are normalized (e.g., dates are ISO formatted, numeric inputs are sent as numbers, not strings).
  - Status codes are expected (200, 201, or clean 4xx validation errors).
- [ ] **Local Storage / Session**: If state is stored, check that local/session storage is populated and cleared correctly on logout.
