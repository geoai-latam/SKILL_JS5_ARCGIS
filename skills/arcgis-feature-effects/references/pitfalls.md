# Extended Pitfalls: Feature Effects

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Confusing effect with renderer

### Anti-pattern

```typescript
layer.effect = "red"; // not how styling works
```

### Correct

```typescript
layer.renderer = new SimpleRenderer({ symbol });
layer.effect = "drop-shadow(2px, 2px, 3px)"; // post-process only
```

### Impact

`effect` can't set fill color; that's the renderer's job.

### Diagnosis

No color change from `effect`; move styling to the renderer.

---

## Pitfall 2: Setting featureEffect without a filter

### Anti-pattern

```typescript
// Expecting this to glow only "the important ones"
layer.featureEffect = new FeatureEffect({ includedEffect: "bloom(2,1px,0)" });
```

### Correct

```typescript
layer.featureEffect = new FeatureEffect({
  filter: new FeatureFilter({ where: "POP > 100000" }),
  includedEffect: "bloom(2,1px,0)",
});
```

### Impact

Measured with 5.1.27: without a filter **every** feature counts as included, so the whole layer gets
`includedEffect` (and `excludedEffect` never applies).

### Diagnosis

The whole layer glows, or a dimming you set as `excludedEffect` never shows; supply a `filter`.

---

## Pitfall 3: Effects on a basemap/tile layer

### Anti-pattern

```typescript
tileLayer.featureEffect = ...; // tile layers have no features
```

### Correct

```typescript
tileLayer.effect = "grayscale(100%)"; // layer-wide effect is fine
```

### Impact

`featureEffect` needs feature data; tile layers only support `effect`.

### Diagnosis

`featureEffect` has no visible result on tile layers.

---

## Pitfall 4: Forgetting effects don't affect hitTest

### Anti-pattern

```typescript
// Assuming excludedEffect: opacity(0%) removes features from clicks
```

### Correct

```typescript
layerView.filter = new FeatureFilter({ where: "POP > 100000" }); // client side, no new request
// or, on the server: layer.definitionExpression = "POP > 100000";
```

### Impact

Measured: an `opacity(0%)` feature is still returned by `view.hitTest` and counted by
`layerView.queryFeatureCount()`.

### Diagnosis

Clicks hit "hidden" features; use a definition expression to truly exclude.

---

## Pitfall 5: Animating effects every frame

### Anti-pattern

```typescript
setInterval(() => (layer.effect = `bloom(${rand()},1px,0)`), 16);
```

### Correct

```typescript
// Set effects on state changes, not on a tight timer.
```

### Impact

Constant re-composition stutters rendering.

### Diagnosis

High GPU usage from frequent effect changes.
