# Extended Pitfalls: Utility Networks

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis. Measured on SDK 5.1.27 with
> `tests/runtime/casos/arcgis-utility-networks.ts`, without credentials; pitfall 3 is from the SDK types, not
> measured.

## Pitfall 1: Loading a secured network without signing in

### Anti-pattern

```typescript
const un = new UtilityNetwork({ layerUrl: securedUrl });
await un.load(); // waits for a sign-in that never comes
```

### Correct

```typescript
// Register OAuth (see arcgis-authentication) before loading; then:
const un = new UtilityNetwork({ layerUrl: securedUrl });
await un.load();
```

### Impact

Measured on Esri's Naperville sample ("Token Required"): `load()` was still pending at 15 s, `loadStatus` stayed
`"loading"`, and a sign-in dialog was added to the page. No error reaches the code.

### Diagnosis

A spinner forever and a dialog the user did not expect; configure authentication.

---

## Pitfall 2: The trace analysis component without a utility network web map

### Anti-pattern

```html
<arcgis-map basemap="osm">
  <arcgis-utility-network-trace-analysis slot="top-right"></arcgis-utility-network-trace-analysis>
</arcgis-map>
```

### Correct

```html
<arcgis-map item-id="YOUR_UN_WEBMAP_ID">
  <arcgis-utility-network-trace-analysis slot="top-right"></arcgis-utility-network-trace-analysis>
</arcgis-map>
```

### Impact

Measured: the component reports `state: "ready"` and shows its Inputs and Results tabs, but there is nothing to trace,
and the console says "The property `utilityNetworks` is empty but must have at least one element".

### Diagnosis

An empty network selector; check that the map comes from a web map with `utilityNetworks`.

---

## Pitfall 3: Ignoring terminals and ignored starting points

### Anti-pattern

```typescript
const traceLocations = [{ type: "starting-point" as const, globalId: transformerId }]; // no terminalId
```

### Correct

```typescript
const terminals = un.getTerminalConfiguration(transformerGraphic)?.terminals ?? [];
const traceLocations = [{ type: "starting-point" as const, globalId: transformerId, terminalId: terminals[1]?.id }];
// after the trace: if (result.startingPointsIgnored) inspect result.warnings
```

### Impact

On a multi-terminal device, the terminal decides which side of it the trace follows. `terminalId` defaults to
`null` (measured), and a location the network cannot use is reported in `startingPointsIgnored`, not as an error.

### Diagnosis

A trace that returns the wrong side of a device, or almost nothing; check the terminal and `startingPointsIgnored`.
