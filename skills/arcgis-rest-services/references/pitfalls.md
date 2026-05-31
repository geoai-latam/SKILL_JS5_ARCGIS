# Extended Pitfalls: REST Services

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Wrong service URL (layer vs server)

### Anti-pattern

```typescript
query.executeQueryJSON(FEATURESERVER_URL, q); // missing /0 layer index
```

### Correct

```typescript
query.executeQueryJSON(`${FEATURESERVER_URL}/0`, q);
```

### Impact

The request fails or hits the wrong resource.

### Diagnosis

404/format errors; append the layer index.

---

## Pitfall 2: Geocoding without a spatial reference for the view

### Anti-pattern

```typescript
const c = await locator.addressToLocations(url, { address }); // SR mismatch when placing
```

### Correct

```typescript
const c = await locator.addressToLocations(url, { address, outSpatialReference: view.spatialReference });
```

### Impact

Placed points are offset from the map.

### Diagnosis

Geocode result lands wrong; set `outSpatialReference`.

---

## Pitfall 3: Not handling empty geocode results

### Anti-pattern

```typescript
const best = candidates[0]; // may be undefined
```

### Correct

```typescript
if (candidates.length) { const best = candidates[0]; }
```

### Impact

Runtime error on no-match addresses.

### Diagnosis

`undefined` candidate; guard the array.

---

## Pitfall 4: Ignoring route service quotas

### Anti-pattern

```typescript
// Solving routes on every keystroke
```

### Correct

```typescript
// Debounce; routing is billed per request.
```

### Impact

Cost spikes and rate limits.

### Diagnosis

Quota/billing alerts; debounce calls.

---

## Pitfall 5: Mixing CORS-restricted custom services

### Anti-pattern

```typescript
locator.addressToLocations("http://internal/geocode", { address });
```

### Correct

```typescript
// Use HTTPS + CORS or a proxy for custom services.
```

### Impact

Browser blocks the request.

### Diagnosis

CORS errors; configure the server or a proxy.
