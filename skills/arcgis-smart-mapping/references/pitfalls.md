# Extended Pitfalls: Smart Mapping

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 in `tests/runtime/casos/arcgis-smart-mapping.ts`.

## Pitfall 1: Reusing a renderer after the filter changes

### Anti-pattern

```typescript
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
layer.renderer = renderer;
layer.definitionExpression = "region = 'Andes'"; // breaks still describe the whole layer
```

### Correct

```typescript
layer.definitionExpression = "region = 'Andes'";
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
layer.renderer = renderer;
```

### Impact

Measured: whole layer `min=8035 n=3557`; after `definitionExpression = "st = 'NY'"`, `min=10116 n=187`. A renderer
computed before the filter keeps the old range.

### Diagnosis

Symbology that looks flat after filtering; recompute.

---

## Pitfall 2: Filtering the statistics with `filter.where`

### Anti-pattern

```typescript
colorRendererCreator.createContinuousRenderer({ layer, field, filter: new FeatureFilter({ where: "st = 'NY'" }) });
```

### Correct

```typescript
layer.definitionExpression = "st = 'NY'"; // or a geometry filter: new FeatureFilter({ geometry: extent })
colorRendererCreator.createContinuousRenderer({ layer, field });
```

### Impact

Measured: with `filter.where` the statistics were the whole layer's (`n=3557`). Only geometry filters with an
`intersects` relationship are used.

### Diagnosis

The same range with and without the filter.

---

## Pitfall 3: Expecting the view to scope the statistics

### Anti-pattern

```typescript
await view.goTo(regionExtent);
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field }); // "for this region"
```

### Correct

```typescript
const { renderer } = await colorRendererCreator.createContinuousRenderer({
  layer, view, field, filter: new FeatureFilter({ geometry: view.extent, spatialRelationship: "intersects" }),
});
```

### Impact

Measured: with the view over New York the statistics still covered all 3557 cities (service layer) and all 51
states (client-side layer). The geometry filter in the correct version is the documented way to scope them
(not measured here).

### Diagnosis

A regional view whose ramp is driven by values elsewhere.

---

## Pitfall 4: Discarding the result

### Anti-pattern

```typescript
await colorRendererCreator.createContinuousRenderer({ layer, view, field }); // result ignored
```

### Correct

```typescript
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
layer.renderer = renderer;
```

### Impact

Measured: `layer.renderer` stayed `simple`; the creator does not touch the layer.

### Diagnosis

No visible change after "applying" Smart Mapping.

---

## Pitfall 5: Re-running creators on every navigation

### Anti-pattern

```typescript
reactiveUtils.when(() => view.stationary, () => colorRendererCreator.createContinuousRenderer({ layer, view, field }));
```

### Correct

```typescript
// Compute once, and again only when the field, the filter or the classification changes.
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
layer.renderer = renderer;
```

### Impact

A statistics query to the service per pan or zoom, and a ramp that jumps (not measured).

### Diagnosis

Repeated statistics requests in the network tab.
