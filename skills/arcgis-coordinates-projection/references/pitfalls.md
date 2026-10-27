# Extended Pitfalls: Coordinates & Projection

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Loading the engine repeatedly

### Anti-pattern

```typescript
for (const g of geoms) { await projectOperator.load(); projectOperator.execute(g, sr); }
// and executeMany with geometries in different SRs
```

### Correct

```typescript
if (!projectOperator.isLoaded()) await projectOperator.load();
const out = projectOperator.executeMany(geoms, sr); // all geoms in one SR
```

### Impact

Redundant loads and slow loops; and measured: a geometry in a different SR inside `executeMany`
comes back `null`, without an error.

### Diagnosis

Slow projection; load once, batch with `executeMany`.

---

## Pitfall 2: webMercatorUtils on data it does not understand

### Anti-pattern

```typescript
// ❌ Anti-pattern
const wm = webMercatorUtils.geographicToWebMercator(pointInMagnaSirgas4686);
const polo = webMercatorUtils.geographicToWebMercator(new Point({ x: 0, y: 90 }));
```

### Correct

```typescript
if (!projectOperator.isLoaded()) await projectOperator.load();
const wm = projectOperator.execute(pointInMagnaSirgas4686, SpatialReference.WebMercator);
```

### Impact

Measured with 5.1.27: `canProject(4686, 3857)` is `false`, but `geographicToWebMercator` converts
the 4686 point anyway and stamps it 102100. Latitude is not clamped: 89.9 → y = 44 927 335 and 90 →
103 676 511, outside the ±20 037 508 of the projection. No error in either case.

### Diagnosis

Check `canProject` and the latitude range before the shortcut, or use `projectOperator`.

---

## Pitfall 3: Swapped axes

### Anti-pattern

```typescript
// ❌ Anti-pattern: "lat, lon" order from a CSV or a GPS app
const p = new Point({ x: 4.5981, y: -74.0761 });
```

### Correct

```typescript
const p = new Point({ longitude: -74.0761, latitude: 4.5981 });
```

### Impact

Measured: Bogotá lands at 511858, -12546351 in Web Mercator (Antarctic waters) with no error, since
-74 is a valid latitude.

### Diagnosis

Points on the wrong continent; use `longitude`/`latitude` names instead of `x`/`y`.

---

## Pitfall 4: Projecting already-correct geometry

### Anti-pattern

```typescript
projectOperator.execute(geom, geom.spatialReference); // no-op cost
```

### Correct

```typescript
if (geom.spatialReference.wkid !== targetWkid) projectOperator.execute(geom, targetSR);
```

### Impact

Wasted work projecting to the same SR.

### Diagnosis

Unnecessary projection calls; guard on wkid.

---

## Pitfall 5: Expecting the projection to handle heights

### Anti-pattern

```typescript
// ❌ Anti-pattern: ellipsoidal heights to a system with another vertical datum
```

### Correct

```typescript
// Z passes through a horizontal projection unchanged (measured: z=2600 stays 2600 into 3116).
// Vertical datum changes are not supported: convert heights outside the SDK.
```

### Impact

Z is kept as it was, not converted; with different vertical coordinate systems `execute` throws.

### Diagnosis

Heights identical before and after: that is expected; an exception names the vertical system.
