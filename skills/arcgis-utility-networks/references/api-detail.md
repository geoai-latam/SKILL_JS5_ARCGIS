# API Reference: Utility Networks

## Table of Contents

- [UtilityNetwork](#utilitynetwork)
- [trace](#trace)
- [Trace types](#trace-types)

---

## UtilityNetwork

`@arcgis/core/networks/UtilityNetwork.js`

| Member | Description |
|---|---|
| `new UtilityNetwork({ layerUrl })` | Reference by a feature service layer URL |
| `load()` | Resolve topology, terminals, tiers (await first) |
| `dataElement` | Network schema (domain networks, tiers) |
| `networkSystemLayers` | The system layers (e.g. dirty areas) |

---

## trace

`@arcgis/core/rest/networks/trace.js`

`trace(networkServiceUrl, traceParameters) => Promise<TraceResult>`

| Trace parameter | Description |
|---|---|
| `traceLocations` | Starting points / barriers (with terminalId) |
| `traceType` | connected / upstream / downstream / isolation / subnetwork |
| `traceConfigurationGlobalId` | Named trace configuration on the network |

---

## Trace types

| Type | Use |
|---|---|
| connected | All connected features |
| upstream / downstream | Flow direction |
| isolation | Valves to isolate a section |
| subnetwork | Subnetwork extent |
