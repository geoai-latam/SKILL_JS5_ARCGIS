# Extended Pitfalls: Layers

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Querying before the layer loads its fields

### Anti-pattern

```typescript
const layer = new FeatureLayer({ url });
const q = layer.createQuery(); // objectIdField may be unknown
```

### Correct

```typescript
const layer = new FeatureLayer({ url });
await layer.load();
const q = layer.createQuery();
```

### Impact

Queries can fail or omit the object id before metadata loads.

### Diagnosis

Errors about missing `objectIdField`; add `await layer.load()`.

---

## Pitfall 2: Unbounded queries

### Anti-pattern

```typescript
const { features } = await layer.queryFeatures(); // could return 100k rows
```

### Correct

```typescript
const q = layer.createQuery();
q.where = "region = 'Andes'";
q.num = 2000;
const { features } = await layer.queryFeatures(q);
```

### Impact

Huge responses freeze the UI and may hit server limits.

### Diagnosis

Slow query; check the returned feature count and add a `where`/`num`.

---

## Pitfall 3: Wrong geometry type for the source

### Anti-pattern

```typescript
const layer = new CSVLayer({ url: "data.csv" }); // no lat/lon fields present
```

### Correct

```typescript
const layer = new CSVLayer({ url: "data.csv", latitudeField: "lat", longitudeField: "lon" });
```

### Impact

Points do not render because the layer cannot find coordinates.

### Diagnosis

CSVLayer loads but shows no features; set the coordinate fields explicitly.

---

## Pitfall 4: Index-assigning into map.layers

### Anti-pattern

```typescript
map.layers[0] = newLayer;
```

### Correct

```typescript
map.layers.removeAt(0);
map.layers.add(newLayer, 0);
```

### Impact

The Collection does not emit a change; the view never updates.

### Diagnosis

Layer swap has no visible effect; use Collection methods.

---

## Pitfall 5: Ignoring layer load errors

### Anti-pattern

```typescript
map.add(new FeatureLayer({ url })); // 403/404 fails silently in the corner
```

### Correct

```typescript
const layer = new FeatureLayer({ url });
try { await layer.load(); } catch (e) { console.error("Layer failed", e); }
map.add(layer);
```

### Impact

A broken URL or auth issue shows as a missing layer with no clear cause.

### Diagnosis

`await layer.load()` throws with the real reason (auth, CORS, bad URL).
