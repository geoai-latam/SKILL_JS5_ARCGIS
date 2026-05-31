# Examples: Utility Networks

## Example 1: Load a utility network

**Use case:** prepare a network for tracing.

```typescript
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";

const un = new UtilityNetwork({ layerUrl: "https://.../FeatureServer/0" });
await un.load();
console.log("domain networks:", un.dataElement?.domainNetworks?.length);
```

**Notes:**

- `await load()` resolves topology and config.
- Read `dataElement` for the schema.

---

## Example 2: Run a connected trace

**Use case:** find everything connected to a starting point.

```typescript
import * as trace from "@arcgis/core/rest/networks/trace.js";

const result = await trace.trace(networkServiceUrl, {
  traceType: "connected",
  traceLocations: [{ globalId, terminalId, type: "starting-point" }],
});
```

**Notes:**

- Provide at least one starting point.
- Use the network's trace configuration when required.

---

## Example 3: Trace analysis component

**Use case:** a ready-made trace UI.

```html
<arcgis-map id="myMap">
  <!-- Utility Network Trace Analysis component bound to the map -->
</arcgis-map>
```

**Notes:**

- The component handles starting-point selection and config.
- Great for standard trace workflows without custom code.
