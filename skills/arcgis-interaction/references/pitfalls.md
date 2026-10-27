# Extended Pitfalls: Interaction

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 in `tests/runtime/casos/arcgis-interaction.ts`.

## Pitfall 1: Reading `.graphic` without narrowing the result type

### Anti-pattern

```typescript
view.on("click", async (event) => {
  const { results } = await view.hitTest(event);
  const g = results[0].graphic; // TS2339 in 5.x; a media/route/raster hit has no .graphic
});
```

### Correct

```typescript
view.on("click", async (event) => {
  const { results } = await view.hitTest(event, { include: [myLayer] });
  const hit = results.find((r) => r.type === "graphic");
  if (hit?.type === "graphic") use(hit.graphic);
});
```

### Impact

In 5.x the result is a union with `type`; the 4.x-style code does not compile, and without `include` the first item
is whatever layer is on top (measured: the GraphicsLayer above the FeatureLayer).

### Diagnosis

TS error "Property 'graphic' does not exist on type 'MediaHit'", or the wrong layer's graphic.

---

## Pitfall 2: Expecting the SketchViewModel to clean up the drawings

### Anti-pattern

```typescript
sketch.destroy(); // expecting the drawn shapes to disappear
```

### Correct

```typescript
sketch.destroy();
drawLayer.removeAll(); // the GraphicsLayer you passed; or view.map?.remove(drawLayer)
```

### Impact

Measured: after `destroy()` the drawn graphic stayed in the layer and the layer stayed in the map. `destroy()` only
stops the view model and its listeners.

### Diagnosis

Shapes remain on the map after the drawing tool unmounts.

---

## Pitfall 3: Clicking a label and expecting a label object

### Anti-pattern

```typescript
if (results[0]?.type === "graphic" && isLabel(results[0].graphic)) ... // there is no label graphic
```

### Correct

```typescript
const hit = results.find((r) => r.type === "graphic");
if (hit?.type === "graphic") use(hit.graphic.attributes); // a label hit returns the labeled feature
```

### Impact

Measured: a click on the label text 40 px from the symbol returned the feature's own graphic (`NOMBRE = "Bogotá"`).
Labels are part of the feature for hit testing.

### Diagnosis

Code that tries to tell labels from features never takes the label branch.

---

## Pitfall 4: Guessing the double-click

### Anti-pattern

```typescript
view.on("double-click", (e) => addPoint(e.mapPoint)); // the view also zooms in
```

### Correct

```typescript
view.on("double-click", (e) => { e.stopPropagation(); addPoint(e.mapPoint); });
```

### Impact

The default navigation still runs, so the map jumps on every double-click (documented behavior; not measured here).

### Diagnosis

The map zooms whenever the custom tool handles a double-click.

---

## Pitfall 5: Calling `create()` to "reset" a tool and expecting both to run

### Anti-pattern

```typescript
sketch.create("polygon");
sketch.create("polyline"); // expecting a polygon and then a polyline
```

### Correct

```typescript
button.onclick = () => { void sketch.create("polygon"); }; // a new create cancels the previous one
sketch.on("create", (e) => { if (e.state === "cancel") discardDraft(); });
```

### Impact

Measured: the second call fired `polygon:cancel` and left `activeTool = "polyline"`. Operations do not stack; the
unfinished shape is dropped. Handle `cancel` if you keep a draft.

### Diagnosis

A half-drawn shape disappears when the user switches tools.
