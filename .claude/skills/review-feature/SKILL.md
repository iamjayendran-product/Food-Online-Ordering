---
name: review-feature
description: Use when a feature implementation (F0-F6) is complete and needs independent review before owner sign-off, or to re-review after a fix round. Triggers on "review feature", "review F1", spec-compliance check, or before marking a feature Done in docs/features.md.
arguments: [features]
argument-hint: "[F0|F1|F2|...] (space-separated for more than one)"
context: fork
agent: feature-reviewer
background: false
---

Independently review feature(s) **$ARGUMENTS** of the FoodStation project.

You have no access to the conversation that implemented this feature. Work entirely from what's on disk: `docs/prd/customer-ordering.md` (requirements + Appendix B test cases), `docs/features.md` (deliverables per feature), and the actual code and tests in the repository at /Users/jay/Products/Food-Online-Ordering.

Follow your agent instructions: read the spec, read every relevant file in full, run the verification commands yourself, fix what's wrong, re-verify, and end with exactly one verdict — PASS (nothing to fix, then run `.claude/hooks/mark-reviewed.sh`) or FIXED (list every defect and the fix, do not mark reviewed).
