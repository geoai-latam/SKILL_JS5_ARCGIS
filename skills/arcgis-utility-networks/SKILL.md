---
name: arcgis-utility-networks
description: >
  Work with utility networks in the ArcGIS Maps SDK for JavaScript 5.0: load a
  UtilityNetwork, run traces (connected, upstream/downstream, isolation) via the
  trace REST module, and use the new Utility Network Trace Analysis component for
  a ready UI. Use this skill whenever the user analyzes utility networks (water,
  electric, gas), runs a trace, or works with terminals/associations.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Utility Networks

> **When to use:** Activate this skill whenever the user loads a utility network, runs a trace, or
> analyzes connectivity (water/electric/gas).

## Overview

A `UtilityNetwork` models connected infrastructure; traces follow connectivity from starting points.

- **Problem it solves:** connectivity analysis on utility infrastructure.
- **Who it serves:** developers building water/electric/gas network apps.
- **Pattern it teaches:** load the network, define starting points + trace config, run the trace.
- **What it does NOT cover:** generic layers (see `arcgis-layers`) or routing (see `arcgis-rest-services`).

## Quick Start

```typescript
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";
const un = new UtilityNetwork({ layerUrl: "https://.../FeatureServer/0" });
await un.load();
```

## Decision Tree

1. **Need a ready trace UI?**
   - Yes → the Utility Network Trace Analysis component.

2. **Custom trace logic?**
   - Yes → load the `UtilityNetwork`, build trace parameters, call the trace REST module.

3. **Which trace type?**
   - Connectivity → connected trace; flow → upstream/downstream; valves → isolation.

**Default:** the trace component for standard UX; the REST module for custom analysis.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";
```

### Dynamic Imports (CDN)

```javascript
const trace = await $arcgis.import("@arcgis/core/rest/networks/trace.js");
```

### Map Components (recommended for new projects)

```typescript
// The trace analysis component provides a turnkey trace UI bound to the map.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Loading the network

`new UtilityNetwork({ layerUrl })` then `await un.load()` resolves the network topology, terminal
configurations, and tiers needed before tracing.

### Concept 2: Trace parameters

A trace needs starting points (and optional barriers), a trace type, and a trace configuration
(global id or named config) defined on the network.

### Concept 3: Terminals and associations

Devices have terminals; connectivity/containment/attachment associations define how features relate.
Traces honor these, so terminal selection affects results.

## Common Pitfalls (Top 3)

### Pitfall 1: Tracing before the network loads

```typescript
// ❌ Anti-pattern
const un = new UtilityNetwork({ layerUrl });
runTrace(un); // topology not ready
```

```typescript
// ✅ Correct
const un = new UtilityNetwork({ layerUrl });
await un.load();
runTrace(un);
```

**Impact:** the trace fails because topology/config isn't available.

### Pitfall 2: Missing starting points

```typescript
// ❌ Anti-pattern
// Running a trace with no starting points
```

```typescript
// ✅ Correct
// Provide at least one valid starting point (and barriers as needed).
```

**Impact:** the trace errors or returns nothing.

### Pitfall 3: Wrong terminal on a device

```typescript
// ❌ Anti-pattern
// Selecting a starting point without specifying its terminal on multi-terminal devices
```

```typescript
// ✅ Correct
// Specify the terminalId so flow direction is correct.
```

**Impact:** trace follows the wrong path through a device.

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
- [UtilityNetwork](https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-UtilityNetwork.html)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
