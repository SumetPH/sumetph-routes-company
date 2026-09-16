# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repo root.
- ADRs in `docs/adr/` that touch the area you are about to work in.

If these files do not exist, proceed silently. Domain documentation is created lazily by `/domain-modeling` when terms or decisions actually get resolved.

## File structure

This repo uses a single-context layout:

- `CONTEXT.md`: the repo's domain glossary and context.
- `docs/adr/`: architecture decision records.

## Use the glossary's vocabulary

When naming a domain concept in an issue title, a refactor proposal, a hypothesis, or a test name, use the term defined in `CONTEXT.md`.

If a concept is missing, reconsider whether it belongs to the project's vocabulary or note a real gap for `/domain-modeling`.

## Flag ADR conflicts

If your output contradicts an existing ADR, identify the ADR explicitly and explain why the decision should be reopened.
