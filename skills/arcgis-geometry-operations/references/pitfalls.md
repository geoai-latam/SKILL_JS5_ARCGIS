# Extended Pitfalls: Geometry Operations

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Mismatched spatial references

### Anti-pattern

```typescript
intersectionOperator.execute(webMercatorGeom, wgs84Geom);
```

### Correct

```typescript
// Project one of them first (projectOperator, see arcgis-coordinates-projection).
```

### Impact

Measured with 5.1.27: no exception; the result is `null`, which looks like "they do not overlap".

### Diagnosis

An overlay that is always empty; compare `geometry.spatialReference.wkid` of both inputs.

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

## Pitfall 3: Planar area in Web Mercator far from the equator

### Anti-pattern

```typescript
areaOperator.execute(bigPolygonInWebMercator, { unit: "square-kilometers" });
```

### Correct

```typescript
await geodeticAreaOperator.load();
geodeticAreaOperator.execute(bigPolygonInWebMercator, { unit: "square-kilometers" });
```

### Impact

Web Mercator meters grow with latitude: measured, a planar 1000 m buffer covers 0.787 km² of real
ground at 60°N (a 1 km circle is 3.142). Planar area over-reports by the same factor.

### Diagnosis

Areas that look right near the equator and wrong at high latitudes.

---

## Pitfall 4: Forgetting load() on geodetic operators

### Anti-pattern

```typescript
geodeticLengthOperator.execute(route, { unit: "kilometers" });
```

### Correct

```typescript
await geodeticLengthOperator.load();
geodeticLengthOperator.execute(route, { unit: "kilometers" });
```

### Impact

Measured: `execute` throws an opaque "m is not a function"; `isLoaded()` is `false`.

### Diagnosis

A minified "is not a function" from inside `@arcgis/core`; check `op.isLoaded()`.

---

## Pitfall 5: Writing new code with geometryEngine

### Anti-pattern

```typescript
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";
geometryEngine.union(polygons);
```

### Correct

```typescript
import * as unionOperator from "@arcgis/core/geometry/operators/unionOperator.js";
unionOperator.executeMany(polygons);
```

### Impact

It works in 5.1 with no runtime warning, but it is deprecated since 4.32: TypeScript shows the
strike-through, and it is a module that will go away.

### Diagnosis

`@deprecated` hints in the editor; see the migration table in `api-detail.md`.
