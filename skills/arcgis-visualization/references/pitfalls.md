# Extended Pitfalls: Visualization

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis. Measured on SDK 5.1.27 by
> reading back the drawn pixels, with `tests/runtime/casos/arcgis-visualization.ts`.

## Pitfall 1: Unique values in a different case than the data

### Anti-pattern

```typescript
new UniqueValueRenderer({ field: "TYPE", uniqueValueInfos: [{ value: "park", symbol }], defaultSymbol });
// the data says "Park"
```

### Correct

```typescript
const { features } = await layer.queryFeatures({ where: "1=1", outFields: ["TYPE"], returnDistinctValues: true, returnGeometry: false });
const values = features.map((f) => f.attributes.TYPE); // copy the values exactly as the service returns them
```

### Impact

Measured: a feature with `"Park"` drew in the default symbol, not in the `"park"` one. The field name, by contrast,
is matched without case: `field: "type"` on a `TYPE` field drew like `field: "TYPE"`.

### Diagnosis

Every feature in the default symbol; compare the values in the renderer with the distinct values in the data.

---

## Pitfall 2: Null values with no defaultSymbol

### Anti-pattern

```typescript
new ClassBreaksRenderer({ field: "pop2000", classBreakInfos }); // some rows are null
```

### Correct

```typescript
new ClassBreaksRenderer({ field: "pop2000", classBreakInfos, defaultSymbol, defaultLabel: "No data" });
```

### Impact

Measured: a null value was not drawn at all without `defaultSymbol`. The legend shows no hint that features are
missing.

### Diagnosis

Holes in a choropleth where the data has no value; add `defaultSymbol` and a `defaultLabel`.

---

## Pitfall 3: Assuming the upper class owns a shared boundary

### Anti-pattern

```typescript
// Expecting 100 to be in "100 and over"
classBreakInfos: [{ minValue: 0, maxValue: 100, label: "under 100" }, { minValue: 100, maxValue: 300, label: "100 and over" }];
```

### Correct

```typescript
classBreakInfos: [{ minValue: 0, maxValue: 100, label: "0 to 100" }, { minValue: 100, maxValue: 300, label: "over 100 to 300" }];
```

### Impact

Measured: a feature with exactly 100 drew in the first class (`maxValue` is inclusive). Labels that say "under 100"
then lie for those features.

### Diagnosis

Boundary values in an unexpected class; label the breaks as the renderer applies them.
