## Agent skills

### Issue tracker

Issues and specs live as local Markdown files under `.scratch/<feature>/`. Read `docs/agents/issue-tracker.md` when creating, fetching, or updating tickets and specs.

### Triage labels

Use the five canonical triage labels as issue statuses. Read `docs/agents/triage-labels.md` when assigning or changing triage state.

### Domain docs

Use a single-context layout: root `CONTEXT.md` and `docs/adr/`. Read `docs/agents/domain.md` before exploring the codebase.

### Formatting

After editing files, run `pnpm exec prettier --write <changed-files>` from the owning app (`web` or `api`) before final validation and handoff. Format root documentation with the web app's Prettier. Run `pnpm format:check` in each affected app and resolve formatting errors before completing the task.
