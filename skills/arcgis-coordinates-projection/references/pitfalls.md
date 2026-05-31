# Extended Pitfalls: Coordinates & Projection

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Loading the engine repeatedly

### Anti-pattern

```typescript
for (const g of geoms) { await projectOperator.load(); projectOperator.execute(g, sr); }
```

### Correct

```typescript
await projectOperator.load();
const out = projectOperator.executeMany(geoms, sr);
```

### Impact

Redundant loads and slow loops.

### Diagnosis

Slow projection; load once, batch with `executeMany`.

---

## Pitfall 2: Assuming the view is always 3857

### Anti-pattern

```typescript
const wm = webMercatorUtils.geographicToWebMercator(point); // view might be 4326
```

### Correct

```typescript
// Project to view.spatialReference, which may not be web mercator.
```

### Impact

Misaligned graphics when the view uses another SR.

### Diagnosis

Graphics offset; project to `view.spatialReference`.

---

## Pitfall 3: Datum differences ignored

### Anti-pattern

```typescript
// Treating two similar WKIDs as identical across datums
```

### Correct

```typescript
// Use a geographic/datum transformation when WKIDs differ in datum.
```

### Impact

Meter-level offsets between datums.

### Diagnosis

Consistent small offset; apply a datum transformation.

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

## Pitfall 5: Losing z/m values

### Anti-pattern

```typescript
// Assuming projection preserves z/m the same way for all systems
```

### Correct

```typescript
// Verify hasZ/hasM expectations after projecting.
```

### Impact

Dropped elevation/measure values.

### Diagnosis

Missing z/m post-projection; check geometry flags.
