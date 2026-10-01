# Adversarial Review Finding Contract

This reference defines the strict, machine-actionable finding contract used during adversarial review rounds.

---

## Finding Schema (Markdown / YAML)

When emitting findings, the reviewer must adhere strictly to this schema:

```markdown
### F<Number>: [<Category>] <Short Finding Title>
- **Severity**: BLOCKER | MAJOR | MINOR
- **Location**: `<target-file>#L<line>`
- **Adversarial Challenge**: <Why this fails in practice, violates repository standards, or introduces failure modes>
- **Proposed Remediation**: <Surgical, concrete fix or counter-proposal>
```

---

## Severity Definitions

| Severity | Definition | Convergence Impact |
| :--- | :--- | :--- |
| **`BLOCKER`** | Factually wrong, unexecutable, hallucinated commands/tools/paths, or unbounded recursion. | **Blocks convergence**. Must be resolved or explicitly verified across review rounds. |
| **`MAJOR`** | Mechanically unenforceable, uncalibrated degrees of freedom, severe token waste, or missing error fallbacks. | **Blocks convergence**. Must be resolved or countered with architectural justification. |
| **`MINOR`** | Phrasing clarity, localized redundancy, formatting, or typo. | Non-blocking. Addressed surgically. |

---

## Machine-Actionable YAML Summary (Optional for Structured Harnesses)

For automated or programmatic harnesses:

```yaml
review_round:
  round_number: 1
  base_sha: "2df95be..."
  target_file: "skills/code-review/SKILL.md"
  verdict: INCOMPLETE  # CONVERGED | INCOMPLETE | ESCALATE
  findings_count:
    blocker: 1
    major: 2
    minor: 1
  findings:
    - id: "F1"
      severity: "BLOCKER"
      category: "Plausibility"
      location: "skills/code-review/SKILL.md#L86"
      challenge: "Cited non-existent CLI flag --foo."
      remediation: "Replace with valid flag --bar."
```
