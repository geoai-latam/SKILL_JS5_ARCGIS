# Examples: Utility Networks

## Example 1: Load the network from a web map

**Use case:** prepare a network for tracing, after the app signed in.

```typescript
import WebMap from "@arcgis/core/WebMap.js";

const webMap = new WebMap({ portalItem: { id: "YOUR_UN_WEBMAP_ID" } });
await webMap.load();
const un = webMap.utilityNetworks?.at(0);
if (un) {
  await un.load();
  console.log(un.domainNetworkNames, un.sharedNamedTraceConfigurations.map((c) => c.title));
}
```

**Notes:**

- On a secured service without a session, `load()` stays pending while a sign-in dialog opens.
- `sharedNamedTraceConfigurations` lists the configurations saved with the web map.

---

## Example 2: Run a trace with a named configuration

**Use case:** everything downstream of a device terminal.

```typescript
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters.js";
import * as trace from "@arcgis/core/rest/networks/trace.js";

const params = new TraceParameters({
  namedTraceConfigurationGlobalId: cfgId,
  traceLocations: [{ type: "starting-point", globalId: deviceGlobalId, terminalId: 2 }],
});
const result = await trace.trace(networkServiceUrl, params);
if (result.startingPointsIgnored) console.warn(result.warnings);
```

**Notes:**

- `params` must be a `TraceParameters` instance; a plain object throws a `TypeError`.
- With a loaded network, `un.trace({ namedTraceConfigurationGlobalId, traceLocations })` does the same and takes plain
  objects.

---

## Example 3: Trace analysis component

**Use case:** a ready-made trace UI.

```html
<arcgis-map item-id="YOUR_UN_WEBMAP_ID">
  <arcgis-utility-network-trace-analysis slot="top-right"></arcgis-utility-network-trace-analysis>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-utility-network-trace-analysis";

const analysis = document.querySelector("arcgis-utility-network-trace-analysis")!;
analysis.addEventListener("arcgisTraceResultFeaturesReady", () => {
  console.log(analysis.traceResultFeatures.length);
});
```

**Notes:**

- The map must come from a web map that stores the network and its configurations.
- The component does not support proxied services, stored credentials, or the `circuit` trace type.
