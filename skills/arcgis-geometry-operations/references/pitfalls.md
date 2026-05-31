# Extended Pitfalls: Geometry Operations

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Mismatched spatial references

### Anti-pattern

```typescript
intersectionOperator.execute(webMercatorGeom, wgs84Geom);
```

### Correct

```typescript
// Project both geometries to the same spatial reference first.
```

### Impact

Wrong or empty results from mixed coordinate systems.

### Diagnosis

Unexpected empty overlay; compare `geometry.spatialReference`.

---

## Pitfall 2: Ignoring null operator results

### Anti-pattern

```typescript
const poly = bufferOperator.execute(g, 100);
useIt(poly); // poly may be null/undefined
```

### Correct

```typescript
const poly = bufferOperator.execute(g, 100);
if (poly) useIt(poly);
```

### Impact

Runtime errors on null geometry.

### Diagnosis

`Cannot read properties of null`; guard the result.

---

## Pitfall 3: Using planar area for large polygons

### Anti-pattern

```typescript
geometryEngine.planarArea(bigPolygon);
```

### Correct

```typescript
geometryEngine.geodesicArea(bigPolygon, "square-kilometers");
```

### Impact

Significant area error far from the projection center.

### Diagnosis

Area looks off for large/again far-from-center polygons.

---

## Pitfall 4: Forgetting to simplify before union

### Anti-pattern

```typescript
geometryEngine.union(rawPolygons);
```

### Correct

```typescript
geometryEngine.union(rawPolygons.map((p) => geometryEngine.simplify(p)));
```

### Impact

Slivers/holes from non-simple inputs.

### Diagnosis

Odd union artifacts; simplify inputs.

---

## Pitfall 5: Heavy sync work freezing the UI

### Anti-pattern

```typescript
for (const g of thousands) geometryEngine.buffer(g, 50);
```

### Correct

```typescript
// Use operators' executeMany, or run analysis in a worker.
```

### Impact

UI jank on large batches.

### Diagnosis

Long task warnings; batch or offload to a worker.
