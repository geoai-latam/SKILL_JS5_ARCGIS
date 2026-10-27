# Extended Pitfalls: REST Services

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 in `tests/runtime/casos/arcgis-rest-services.ts` (public services, no API key).

## Pitfall 1: Using the first candidate without checking

### Anti-pattern

```typescript
const best = (await locator.addressToLocations(url, { address })).at(0)!; // "there is always one"
view.goTo(best.location);
```

### Correct

```typescript
const candidates = await locator.addressToLocations(url, { address });
const best = candidates.find((c) => c.score >= 90);
if (best?.location) await view.goTo(best.location);
```

### Impact

Measured: a nonsense address returned an empty array, not an error, so `candidates[0]` is `undefined`.

### Diagnosis

`Cannot read properties of undefined` after a geocode; guard the array and the score.

---

## Pitfall 2: Reading candidate attributes without `outFields`

### Anti-pattern

```typescript
const [c] = await locator.addressToLocations(url, { address });
const city = c.attributes.City; // undefined
```

### Correct

```typescript
const [c] = await locator.addressToLocations(url, { address, outFields: ["Addr_type", "City", "Country"] });
```

### Impact

Measured: without `outFields`, `attributes` had 0 keys; with them,
`{"Addr_type":"POI","City":"Bogotá","Country":"COL"}`.

### Diagnosis

Empty `attributes` on candidates; list the fields (or `["*"]`).

---

## Pitfall 3: Expecting turn-by-turn text by default

### Anti-pattern

```typescript
const r = await route.solve(url, new RouteParameters({ stops }));
r.routeResults[0].directions?.features; // undefined
```

### Correct

```typescript
const r = await route.solve(url, new RouteParameters({ stops, returnDirections: true, directionsLanguage: "es" }));
const steps = r.routeResults[0].directions?.features.map((f) => f.attributes.text);
```

### Impact

Measured: by default the result had the route polyline but no directions; with the two options it had 12 Spanish
maneuvers.

### Diagnosis

A route on the map and an empty directions panel.

---

## Pitfall 4: Standalone queries without geometry or past the cap

### Anti-pattern

```typescript
const fs = await query.executeQueryJSON(`${url}/0`, { where: "1=1", outFields: ["objectid"] });
fs.features.forEach((f) => view.graphics.add(f)); // nothing drawn, and only part of the rows
```

### Correct

```typescript
const total = await query.executeForCount(`${url}/0`, { where: "1=1" });
const fs = await query.executeQueryJSON(`${url}/0`, { where: "1=1", outFields: ["objectid"], returnGeometry: true });
if (fs.exceededTransferLimit) { /* page with start/num, see arcgis-layers */ }
```

### Impact

Measured: the features had `geometry` `null`, and `where: "1=1"` brought 1000 of 3557 rows
(`exceededTransferLimit: true`).

### Diagnosis

Invisible graphics or counts that stop at the service's `maxRecordCount`.

---

## Pitfall 5: Hand-building requests where a helper exists

### Anti-pattern

```typescript
await esriRequest(`${url}/solve?stops=-74.08,4.6;-74.05,4.65&f=json`); // hand-built
```

### Correct

```typescript
await route.solve(url, new RouteParameters({ stops })); // serializes stops, SR and options for you
```

### Impact

Fragile URLs and response JSON you must parse into classes yourself (not measured; style advice).

### Diagnosis

String-concatenated REST URLs in the code.
