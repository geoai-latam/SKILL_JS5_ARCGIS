# Extended Pitfalls: Time & Animation

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis. Measured on SDK 5.1.27 with
> `tests/runtime/casos/arcgis-time-animation.ts`.

## Pitfall 1: Re-querying the service on every step

### Anti-pattern

```typescript
setInterval(() => layer.queryFeatures(nextQuery()), 200); // a request per frame
```

### Correct

```typescript
setInterval(() => { view.timeExtent = nextWindow(); }, 200); // filters what the layer already has
```

### Impact

Measured on the hurricanes layer: 10 weekly `view.timeExtent` steps made 0 requests to `/query`. A query per step
adds a round trip per frame.

### Diagnosis

The network tab fills with `/query` calls while the animation runs.

---

## Pitfall 2: A layer that should not filter, filtering

### Anti-pattern

```typescript
view.timeExtent = januaryWindow; // the reference layer of stations also vanishes
```

### Correct

```typescript
stations.useViewTime = false; // this layer ignores the view's window
view.timeExtent = januaryWindow;
```

### Impact

Measured: with `useViewTime = false`, 12 of 12 records stayed visible in a January window.

### Diagnosis

Context layers disappear when the slider moves.

---

## Pitfall 3: A layer window that does not overlap the view's

### Anti-pattern

```typescript
layer.timeExtent = juneToDecember;
view.timeExtent = january; // the layer shows the intersection: nothing
```

### Correct

```typescript
layer.timeExtent = null; // or a range that contains the view's window
view.timeExtent = january;
```

### Impact

Measured: a June–December `layer.timeExtent` with a January view window showed 0 records, with no error.

### Diagnosis

One layer stays empty at every slider position; check `layer.timeExtent`.

---

## Pitfall 4: Expecting the slider to start filtering by itself

### Anti-pattern

```html
<arcgis-map basemap="osm"><arcgis-time-slider slot="bottom-left"></arcgis-time-slider></arcgis-map>
```

### Correct

```typescript
await layer.load();
slider.fullTimeExtent = layer.timeInfo!.fullTimeExtent;
```

### Impact

Measured: with a time-enabled layer in the map and nothing else, `view.timeExtent` stayed `null` and every record
was drawn. After setting `fullTimeExtent`, `view.timeExtent` became the first one-day window.

### Diagnosis

A blank or disabled slider and an unfiltered map.
