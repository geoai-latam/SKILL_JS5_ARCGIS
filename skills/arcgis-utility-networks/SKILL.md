---
name: arcgis-utility-networks
description: >
  Work with utility networks in the ArcGIS Maps SDK for JavaScript 5.1: load a
  UtilityNetwork (from a web map or a layer URL; secured services hang on a
  sign-in dialog), run traces with utilityNetwork.trace() and TraceParameters
  (the JS name is namedTraceConfigurationGlobalId; the REST name is dropped
  silently), and the arcgis-utility-network-trace-analysis component (the old
  arcgis-utility-network-trace is deprecated since 5.0, and the new one needs a
  web map that stores the network). Use this skill whenever the user analyzes
  utility networks (water, electric, gas), runs a trace, or works with terminals.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - utility-network
  - trace
  - terminals
  - isolation
  - networks
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Utility Networks

> **When to use:** Activate this skill whenever the user loads a utility network, runs a trace, or
> analyzes connectivity (water/electric/gas).

## Overview

A `UtilityNetwork` models connected infrastructure; a trace follows connectivity from starting points.

- **Problem it solves:** connectivity analysis on utility infrastructure.
- **Who it serves:** developers building water, electric, and gas network apps.
- **Pattern it teaches:** get the network from a web map, sign in, pick a named trace configuration, trace.
- **What it does NOT cover:** generic layers (see `arcgis-layers`), routing (see `arcgis-rest-services`), or sign-in
  itself (see `arcgis-authentication`).

## Quick Start

```typescript
import WebMap from "@arcgis/core/WebMap.js";

const webMap = new WebMap({ portalItem: { id: "YOUR_UN_WEBMAP_ID" } }); // a web map that stores the network
await webMap.load();
const un = webMap.utilityNetworks?.at(0);
if (un) {
  await un.load();
  const config = un.sharedNamedTraceConfigurations[0]; // configurations saved with the web map
  const result = await un.trace({
    namedTraceConfigurationGlobalId: config.globalId,
    traceLocations: [{ type: "starting-point", globalId: "{FEATURE-GLOBALID}", terminalId: 1 }],
  });
  console.log(result.elements.length, result.startingPointsIgnored);
}
```

Utility network services are secured: the app must sign in first (`arcgis-authentication`). Esri's public Naperville
sample answers "Token Required" without a session.

## Decision Tree

1. **Need a ready trace UI?**
   - Yes → `arcgis-utility-network-trace-analysis` in a map loaded from a web map that stores the network.
   - Not `arcgis-utility-network-trace`: deprecated since 5.0.

2. **Custom trace logic?**
   - Yes → `un.trace({ namedTraceConfigurationGlobalId, traceLocations })` (it fills `gdbVersion` and `moment`), or
     the REST `trace(url, new TraceParameters(...))` when you only have the service URL.

3. **Which trace type?**
   - Connectivity → `connected`; flow → `upstream`/`downstream`; valves → `isolation`; a path → `path`
     (`shortest-path` is deprecated in ArcGIS Pro 3.7 and Enterprise 12.1).

**Default:** the trace analysis component for standard UX; `un.trace()` with a named configuration for custom work.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters.js";
```

### Dynamic Imports (CDN)

```javascript
const UtilityNetwork = await $arcgis.import("@arcgis/core/networks/UtilityNetwork.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-utility-network-trace-analysis";
```

## Key Concepts

### Concept 1: Where the network comes from

A web map saved with a utility network exposes it as `webMap.utilityNetworks`, together with the trace
configurations shared with it (`sharedNamedTraceConfigurations`). `new UtilityNetwork({ layerUrl })` also works, but
then there are no shared configurations; ask the service with `un.queryNamedTraceConfigurations()`.

### Concept 2: A trace is a configuration plus locations

A named trace configuration (its `globalId`) carries the trace type, tiers, and filters. Trace locations are
`starting-point`, `stopping-point`, or `barrier`, each a feature `globalId` with a `terminalId` on multi-terminal
devices or a `percentAlong` on lines.

### Concept 3: Read what the trace ignored

`TraceResult` returns `elements`, `aggregatedGeometry`, `globalFunctionResults`, and also `startingPointsIgnored` and
`warnings`: a location the network could not use does not fail the trace, it is reported there.

## Common Pitfalls (Top 3)

### Pitfall 1: Using the REST parameter name in JavaScript

```typescript
// ❌ Anti-pattern: the REST name; the JS class drops it
new TraceParameters({ traceConfigurationGlobalId: cfgId } as never);
```

```typescript
// ✅ Correct: the JS name, serialized as traceConfigurationGlobalId
new TraceParameters({ namedTraceConfigurationGlobalId: cfgId });
```

**Impact:** measured on 5.1.27: with the REST name, `namedTraceConfigurationGlobalId` is `null` and `toJSON()` has no
configuration at all, with no error. The trace goes out without one.

### Pitfall 2: Passing a plain object to the REST trace

```typescript
// ❌ Anti-pattern
await trace.trace(url, { traceType: "connected", traceLocations }); // TypeError: n2.toJSON is not a function
```

```typescript
// ✅ Correct
await trace.trace(url, new TraceParameters({ namedTraceConfigurationGlobalId: cfgId, traceLocations }));
// or, with a loaded network: await un.trace({ namedTraceConfigurationGlobalId: cfgId, traceLocations })
```

**Impact:** measured: the REST module calls `toJSON()` on its parameters and throws a `TypeError` before any request.
Strict TypeScript also rejects the plain object (TS2740).

### Pitfall 3: Building on the deprecated trace component

```html
<!-- ❌ Anti-pattern -->
<arcgis-utility-network-trace></arcgis-utility-network-trace>
```

```html
<!-- ✅ Correct, inside a map loaded from a web map that stores the network -->
<arcgis-map item-id="YOUR_UN_WEBMAP_ID">
  <arcgis-utility-network-trace-analysis slot="top-right"></arcgis-utility-network-trace-analysis>
</arcgis-map>
```

**Impact:** `arcgis-utility-network-trace` is `@deprecated since 5.0`. Its replacement needs the network in the web
map: measured in a map with only a basemap, it reached `state: "ready"` and drew its tabs, and the console logged
"The property `utilityNetworks` is empty but must have at least one element".

## When to Read references/

| If you need... | Read |
|---|---|
| UtilityNetwork / trace signatures | `references/api-detail.md` |
| Trace examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — the feature layers in the network
- `arcgis-editing` — edit network features
- `arcgis-interaction` — pick starting points on the map

## Reference Samples

- [Utility network trace](https://developers.arcgis.com/javascript/latest/sample-code/utility-network-trace/)
- [UtilityNetwork](https://developers.arcgis.com/javascript/latest/references/core/networks/UtilityNetwork/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Runtime checks in `tests/runtime/casos/arcgis-utility-networks.ts`, without
  credentials (the public Naperville sample needs a token, and the harness does not sign in), so no trace ran end to
  end. Fixed: the trace configuration parameter was the REST name `traceConfigurationGlobalId`, which the JS class
  drops silently (measured); the REST trace example passed a plain object, which throws `TypeError: n2.toJSON is not a
  function` (measured; it was also the block failing TS2740); `dataElement.domainNetworks` replaced by the typed
  members. New: `arcgis-utility-network-trace` is deprecated since 5.0, its replacement needs a web map that stores
  the network (measured), a secured service leaves `load()` pending on a sign-in dialog (measured), `un.trace()`,
  `startingPointsIgnored`, and `shortest-path` deprecated. Replaced the five comment-only pitfalls.
- **0.1.0** (2026-05-31): Initial release.
