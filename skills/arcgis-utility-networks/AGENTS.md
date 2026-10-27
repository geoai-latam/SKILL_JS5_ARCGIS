# Agent Guide: arcgis-utility-networks

Quick-reference for utility networks on SDK 5.1. Read before tracing.

## Quick Decision Tree

1. **Turnkey UI?** → `arcgis-utility-network-trace-analysis` in a map loaded from a web map that stores the network.
2. **Custom logic?** → `un.trace({ namedTraceConfigurationGlobalId, traceLocations })` on a loaded network.
3. **Only a service URL?** → REST `trace(url, new TraceParameters({...}))`, never a plain object.
4. **Trace type?** → connected / upstream / downstream / isolation / path (`shortest-path` is deprecated).

## Setup Checklist

- [ ] Sign in before loading: a secured service leaves `load()` pending behind a sign-in dialog.
- [ ] Take the network and its configurations from the web map (`utilityNetworks`, `sharedNamedTraceConfigurations`).
- [ ] Use `namedTraceConfigurationGlobalId`, the JS name; `traceConfigurationGlobalId` is dropped silently.
- [ ] Give `terminalId` on multi-terminal devices and `percentAlong` on lines.
- [ ] Check `result.startingPointsIgnored` and `result.warnings` after the trace.

## Anti-patterns (one-liner reminders)

- ❌ `arcgis-utility-network-trace` (deprecated since 5.0).
- ❌ The trace analysis component in a map without a utility network web map.
- ❌ `traceConfigurationGlobalId` in `TraceParameters` (the REST name).
- ❌ A plain object as the REST trace parameters (`TypeError: n2.toJSON is not a function`).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — UtilityNetwork / trace / parameters
- `references/examples.md` — load, trace, component
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-utility-network.ts`
