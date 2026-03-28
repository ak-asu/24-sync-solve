---
name: plan-check
description: Before implementing a feature, verify the approach aligns with CLAUDE.md and the MVP plan. Prevents drift.
user-invocable: true
---

# Plan Alignment Check

Before writing code for a feature or significant change, verify alignment with the architecture plan.

## When This Runs

User invokes `/plan-check` with a description of what they're about to build. Example: `/plan-check coach directory` or `/plan-check inline editing system`.

## Steps

1. **Read the plan**: Open `CLAUDE.md` and the plan file (`.claude/plans/`) to find sections relevant to `$ARGUMENTS`.
2. **Read the research**: Check `docs/research.md` for requirements related to this feature.
3. **Read current state**: Check what already exists in the codebase for this area.
4. **Compare**: Identify:
   - What the plan specifies (routes, components, DB tables, queries, types)
   - What already exists in the codebase
   - What's missing and needs to be built
   - Any existing code that contradicts the plan
5. **Check cross-cutting concerns**:
   - Security: Does this feature need auth? RLS policies? Input validation?
   - Accessibility: What interactive elements need React Aria support?
   - i18n: What strings need translation keys?
   - Performance: SSG or ISR? Dynamic imports needed?
6. **Produce a build checklist**: Ordered list of files to create/modify

## Output Format

```
## Plan Check: [feature name]

### Requirements (from docs/research.md)
- [Key requirements for this feature]

### Already Done
- [file] — [what it implements]

### To Build (in order)
1. [file path] — [description]
   Depends on: [other files]
   Security: [auth/RLS/validation needs]
   A11y: [accessibility considerations]
   i18n: [translation keys needed]

### Cross-Cutting Concerns
- Security: [what to watch for]
- Accessibility: [WCAG requirements]
- i18n: [strings to extract]
- Performance: [SSG/ISR/dynamic import needs]

### Deviations Found
- [file] deviates from plan: [what's wrong] → [what it should be]

### Open Questions
- [anything unclear that needs user decision]
```

Keep the output actionable. The user should be able to hand this checklist back and say "build it."
