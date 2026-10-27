# Agent Guide: arcgis-core-utilities

Quick-reference for the SDK core utilities. Read before wiring reactive/async logic.

## Quick Decision Tree

1. **Observe a property over time?** → `reactiveUtils.watch`.
2. **Run when a condition becomes true?** → every time: `reactiveUtils.when`; once: `whenOnce`
   (or `{ once: true }`). Callbacks are async and batched; `{ sync: true }` for every change.
3. **Async that can be superseded?** → `promiseUtils.debounce` + `isAbortError`.
4. **REST call?** → `esriRequest`.
5. **Observable array?** → `Collection<T>`.

## Setup Checklist

- [ ] Import utilities as namespaces (`import * as reactiveUtils`).
- [ ] Store every watch/when handle and call `handle.remove()` on cleanup.
- [ ] Wrap superseded async in `try/catch` and ignore abort errors.
- [ ] Mutate Collections via `add`/`removeAt`, never index assignment.

## Anti-patterns (one-liner reminders)

- ❌ Never removing watch handles (memory leak).
- ❌ Showing errors for abort errors.
- ❌ `collection[i] = x` — use `add`/`removeAt`.
- ❌ Preferring legacy `instance.watch()` over `reactiveUtils`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — utility signatures
- `references/examples.md` — watch / debounce / request examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-reactive.ts`, `snippet-request.ts`, `snippet-collection.ts`
