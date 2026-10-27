# Extended Pitfalls: Map Tools

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 in `tests/runtime/casos/arcgis-map-tools.ts`.

## Pitfall 1: A map with no basemap and no layers

### Anti-pattern

```html
<arcgis-map center="-74.08,4.6" zoom="12"><arcgis-measurement></arcgis-measurement></arcgis-map>
```

### Correct

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="12"><arcgis-measurement></arcgis-measurement></arcgis-map>
```

### Impact

Measured: `viewOnReady()` never resolved (40 s), so no tool came up. The view needs a spatial reference from a
basemap or a layer. `arcgis-sketch` alone escaped this because it adds its own layer.

### Diagnosis

Tools that never become ready on an empty map.

---

## Pitfall 2: Assuming the unit

### Anti-pattern

```html
<arcgis-distance-measurement-2d></arcgis-distance-measurement-2d> <!-- assume km -->
```

### Correct

```html
<arcgis-distance-measurement-2d unit="kilometers"></arcgis-distance-measurement-2d>
```

### Impact

Measured: the default is the `"metric"` system, which shows meters or kilometers depending on length; reports
that parse the number without the unit mix scales.

### Diagnosis

Values that jump by a factor of 1000; set `unit` (and `hide-unit-select` if it must not change).

---

## Pitfall 3: Picking a tool `arcgis-measurement` does not have in this view

### Anti-pattern

```typescript
measurement.activeTool = "direct-line"; // in a 2D map
```

### Correct

```typescript
measurement.activeTool = measurement.view?.type === "3d" ? "direct-line" : "distance";
```

### Impact

Measured: accepted silently, `activeWidget` stayed `null`, no tool on screen.

### Diagnosis

An empty measurement panel; check `activeWidget`.

---

## Pitfall 4: Not clearing tool graphics

### Anti-pattern

```typescript
measurement.remove(); // not measured: the tool may leave its graphics behind
```

### Correct

```typescript
await measurement.clear(); // back to activeTool null, state "disabled" (measured)
```

### Impact

Stale lines and labels left on the map.

### Diagnosis

Leftover measurement graphics; call `clear()` before hiding the tool.

---

## Pitfall 5: Feature snapping with no sources

### Anti-pattern

```typescript
sketch.snappingOptions.enabled = true; // featureEnabled true, but featureSources is empty
```

### Correct

```typescript
sketch.snappingOptions.featureSources.add(new FeatureSnappingLayerSource({ layer: parcels, enabled: true }));
```

### Impact

Measured defaults: `featureEnabled: true` with 0 `featureSources`, so only self snapping can happen.

### Diagnosis

Snapping to the shape being drawn works, snapping to other features never does.
