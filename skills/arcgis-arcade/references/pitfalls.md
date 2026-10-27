# Extended Pitfalls: Arcade

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: The field is in the expression but not in the data

### Anti-pattern

```typescript
// The layer or query only fetched objectid
const { features } = await layer.queryFeatures({ where: "1=1", outFields: ["objectid"] });
executor.execute({ $feature: features[0] }); // "$feature.pop2000 / 1000" → 0
```

### Correct

```typescript
layer.outFields = executor.fieldsUsed; // or the query's outFields
```

### Impact

Measured with SDK 5.1.27: the missing field is `null` and the result is 0, with no error. Field
**case** is not the problem: `$feature.pop` reads `POP`.

### Diagnosis

Suspicious zeros; log `executor.fieldsUsed` and compare with what the layer requested.

---

## Pitfall 2: Returning the wrong type for the context

### Anti-pattern

```text
// Label expression returning a number where text is expected
$feature.POP
```

### Correct

```text
Text($feature.POP)
```

### Impact

Type coercion surprises in labels.

### Diagnosis

Odd label formatting; wrap with `Text()`.

---

## Pitfall 3: Division by zero

### Anti-pattern

```text
$feature.POP / $feature.AREA  // AREA may be 0
```

### Correct

```text
IIf($feature.AREA == 0, 0, $feature.POP / $feature.AREA)
```

### Impact

Infinity/NaN in output.

### Diagnosis

Weird density values; guard the denominator.

---

## Pitfall 4: Assuming geometry is available

### Anti-pattern

```text
Area($feature)  // geometry not returned by the query
```

### Correct

```typescript
const { features } = await layer.queryFeatures({ where: "1=1", returnGeometry: executor.geometryUsed });
```

### Impact

Measured with SDK 5.1.27: `Area()` without geometry returns 0, it does not throw.

### Diagnosis

Areas or lengths of 0; check `executor.geometryUsed` against the query.

---

## Pitfall 4b: Planar measures on Web Mercator

### Anti-pattern

```text
Area($feature, 'square-kilometers')  // geometry in Web Mercator
```

### Correct

```text
AreaGeodetic($feature, 'square-kilometers')
```

### Impact

A 0.01° cell at 50° S: 1.928 km² planar vs 0.798 km² geodetic (factor 2.42, measured).

### Diagnosis

Areas that grow with latitude; the geometry's `spatialReference` is 3857/102100.

---

## Pitfall 5: Expensive data functions per feature

### Anti-pattern

```text
FeatureSetByName($map, "Other") // called for every feature
```

### Correct

```text
// Precompute or restructure; avoid heavy data access per feature.
```

### Impact

Severe slowdowns at scale.

### Diagnosis

Lag rendering labels/renderers; remove heavy data calls.

---

## Pitfall 6: `execute()` on a script that reads FeatureSets

### Anti-pattern

```typescript
const e = await createArcadeExecutor("Count(FeatureSetByName($map, 'Parcels'))", createArcadeProfile("popup"));
e.execute({ $feature: graphic, $map: map }); // throws
```

### Correct

```typescript
const result = e.isAsync ? await e.executeAsync({ $feature: graphic, $map: map }) : e.execute({ $feature: graphic, $map: map });
```

### Impact

"Cannot execute the script in synchronous mode" (measured with SDK 5.1.27).

### Diagnosis

Check `executor.isAsync` before choosing the method.
