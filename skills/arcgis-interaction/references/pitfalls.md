# Extended Pitfalls: Interaction

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Assuming results[0] is your layer

### Anti-pattern

```typescript
const { results } = await view.hitTest(event);
const g = results[0].graphic; // could be a label or another layer
```

### Correct

```typescript
const { results } = await view.hitTest(event, { include: [myLayer] });
```

### Impact

You act on the wrong graphic.

### Diagnosis

Inspect `results[i].layer`; filter with `include`.

---

## Pitfall 2: Not destroying the SketchViewModel

### Anti-pattern

```typescript
const sketch = new SketchViewModel({ view, layer }); // never destroyed
```

### Correct

```typescript
sketch.destroy(); // on teardown
```

### Impact

Lingering listeners and graphics.

### Diagnosis

Drawing tools still active after the component unmounts.

---

## Pitfall 3: hitTest in 3D without expecting elevation hits

### Anti-pattern

```typescript
const { results } = await view.hitTest(event); // SceneView may hit terrain/3D objects
```

### Correct

```typescript
const { results } = await view.hitTest(event, { include: [featureLayer] });
```

### Impact

3D scenes return ground/mesh hits you didn't want.

### Diagnosis

Unexpected result types in a SceneView; constrain with `include`.

---

## Pitfall 4: Blocking the click handler with heavy work

### Anti-pattern

```typescript
view.on("click", () => doExpensiveSyncWork());
```

### Correct

```typescript
view.on("click", async () => { await doExpensiveWorkOffThread(); });
```

### Impact

The map feels frozen on each click.

### Diagnosis

Janky clicks; move heavy work async/off-thread.

---

## Pitfall 5: Re-entrant sketch.create calls

### Anti-pattern

```typescript
button.onclick = () => sketch.create("polygon"); // stacks operations
```

### Correct

```typescript
button.onclick = () => { sketch.cancel(); sketch.create("polygon"); };
```

### Impact

Multiple draw operations conflict.

### Diagnosis

Drawing behaves oddly; cancel before starting a new create.
