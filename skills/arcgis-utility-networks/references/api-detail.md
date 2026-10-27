# API Reference: Utility Networks

## Table of Contents

- [UtilityNetwork](#utilitynetwork)
- [trace](#trace)
- [TraceParameters and TraceLocation](#traceparameters-and-tracelocation)
- [TraceResult](#traceresult)
- [Components](#components)

---

## UtilityNetwork

`@arcgis/core/networks/UtilityNetwork.js`

| Member | Description |
|---|---|
| `webMap.utilityNetworks` | The networks saved on a web map (the usual source) |
| `new UtilityNetwork({ layerUrl })` | Reference one by a feature service layer URL |
| `load()` | Resolve the schema; on a secured service it waits for sign-in |
| `domainNetworkNames` / `getTierNames(domain)` | The network's domains and tiers |
| `terminalConfigurations` / `getTerminalById(id)` | Terminals of multi-terminal devices |
| `sharedNamedTraceConfigurations` | Configurations shared with the web map (`globalId`, `title`) |
| `queryNamedTraceConfigurations(query)` | Ask the service for its configurations |
| `trace(props)` / `submitTraceJob(props)` | Run a trace; fills `gdbVersion` and `moment` from the network |
| `networkServiceUrl` | The `UtilityNetworkServer` URL for the REST module |

---

## trace

`@arcgis/core/rest/networks/trace.js`

`trace(url: string, params: TraceParameters, requestOptions?) => Promise<TraceResult>`, where `url` is the
`UtilityNetworkServer` URL and `params` is a `TraceParameters` instance.

---

## TraceParameters and TraceLocation

`@arcgis/core/rest/networks/support/TraceParameters.js`

| Property | Description |
|---|---|
| `namedTraceConfigurationGlobalId` | The named configuration (sent as REST `traceConfigurationGlobalId`) |
| `traceType` | `connected`, `upstream`, `downstream`, `isolation`, `path`, `subnetwork`, `subnetwork-controller`, `loops`, `circuit`, `shortest-path` (deprecated) |
| `traceConfiguration` | An ad hoc configuration instead of a named one |
| `traceLocations` | Starting points, stopping points, and barriers |
| `resultTypes` | What to return (elements, aggregated geometry, function results) |
| `gdbVersion` / `moment` | Version and moment (filled by `un.trace()`) |

`@arcgis/core/rest/networks/support/TraceLocation.js`: `type` (`starting-point`, `stopping-point`, `barrier`),
`globalId`, `terminalId`, `percentAlong`, `isFilterBarrier`. `terminalId` and `percentAlong` default to `null`.

---

## TraceResult

| Property | Description |
|---|---|
| `elements` | Network elements found |
| `aggregatedGeometry` | Merged geometry of the result, when requested |
| `globalFunctionResults` | Results of the configuration's functions |
| `startingPointsIgnored` | `true` when a starting point could not be used |
| `warnings` | Messages from the service |

---

## Components

| Component | Status |
|---|---|
| `arcgis-utility-network-trace-analysis` | Current; needs the network and configurations stored in the web map |
| `arcgis-utility-network-trace` | `@deprecated since 5.0` |
