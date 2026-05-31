# Extended Pitfalls: Smart Mapping

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Reusing a renderer after the data changes

### Anti-pattern

```typescript
// Compute once, then change definitionExpression without recomputing
```

### Correct

```typescript
layer.definitionExpression = "region = 'Andes'";
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
layer.renderer = renderer;
```

### Impact

Breaks/ramp no longer match the filtered data.

### Diagnosis

Symbology looks off after filtering; recompute the renderer.

---

## Pitfall 2: Ignoring the returned statistics

### Anti-pattern

```typescript
const { renderer } = await creator(...); // legend slider has no data
```

### Correct

```typescript
const { renderer, statistics } = await creator(...);
// feed statistics into a histogram/slider widget
```

### Impact

Custom legends/sliders lack the numbers they need.

### Diagnosis

Slider shows wrong range; pass `statistics` through.

---

## Pitfall 3: Running creators on every redraw

### Anti-pattern

```typescript
view.watch("stationary", () => creator(...)); // recompute constantly
```

### Correct

```typescript
// Compute once on load, or when the field/filter actually changes.
```

### Impact

Repeated statistic queries hammer the service and stutter the UI.

### Diagnosis

Frequent stats requests in the network tab.

---

## Pitfall 4: Wrong field type for the chosen module

### Anti-pattern

```typescript
sizeRendererCreator.createContinuousRenderer({ field: "CATEGORY" });
```

### Correct

```typescript
typeRendererCreator.createRenderer({ field: "CATEGORY" });
```

### Impact

Continuous size/color expect numbers; categories belong to `type`.

### Diagnosis

Flat output; match the module to the field type.

---

## Pitfall 5: Forgetting basemap contrast

### Anti-pattern

```typescript
createContinuousRenderer({ layer, view, field }); // ramp clashes with dark basemap
```

### Correct

```typescript
createContinuousRenderer({ layer, view, field, basemap: view.map.basemap });
```

### Impact

Low contrast against the basemap.

### Diagnosis

Hard-to-read colors; pass the basemap so the ramp adapts.
