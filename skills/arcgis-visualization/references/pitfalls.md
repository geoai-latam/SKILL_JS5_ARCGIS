# Extended Pitfalls: Visualization

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Field name case/typo

### Anti-pattern

```typescript
new UniqueValueRenderer({ field: "type" }); // service field is "TYPE"
```

### Correct

```typescript
new UniqueValueRenderer({ field: "TYPE" });
```

### Impact

Every feature falls to the default symbol.

### Diagnosis

All features look identical; check the exact field name in the service.

---

## Pitfall 2: Forgetting defaultSymbol

### Anti-pattern

```typescript
new ClassBreaksRenderer({ field: "POP", classBreakInfos });
```

### Correct

```typescript
new ClassBreaksRenderer({ field: "POP", classBreakInfos, defaultSymbol });
```

### Impact

Out-of-range features are invisible.

### Diagnosis

Some features missing; add `defaultSymbol`.

---

## Pitfall 3: Visual variable stops out of order

### Anti-pattern

```typescript
stops: [{ value: 100, color: "red" }, { value: 0, color: "white" }];
```

### Correct

```typescript
stops: [{ value: 0, color: "white" }, { value: 100, color: "red" }];
```

### Impact

Interpolation looks wrong/reversed.

### Diagnosis

Colors map backwards; sort stops ascending by value.

---

## Pitfall 4: Renderer ignored because set after a webmap loaded

### Anti-pattern

```typescript
// Setting layer.renderer on a webmap layer that already has a saved renderer
```

### Correct

```typescript
const layer = view.map.layers.find((l) => l.title === "Cities");
layer.renderer = myRenderer; // explicit override after the layer resolves
```

### Impact

The saved renderer appears instead of yours.

### Diagnosis

Style doesn't change; ensure you override after the layer is resolved.

---

## Pitfall 5: Heatmap densities not tuned to scale

### Anti-pattern

```typescript
new HeatmapRenderer({ radius: 18 }); // same look at every zoom
```

### Correct

```typescript
new HeatmapRenderer({ radius: 18, referenceScale: 50000 });
```

### Impact

Heat blobs over/under-represent at different zooms.

### Diagnosis

Heatmap intensity shifts oddly when zooming; set a reference scale.
