# Extended Pitfalls: Layers

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Expecting the layer's outFields to limit queries

### Anti-pattern

```typescript
const layer = new FeatureLayer({ url, outFields: ["areaname", "pop2000"] });
const { features } = await layer.queryFeatures(layer.createQuery()); // expecting 2 fields
```

### Correct

```typescript
const q = layer.createQuery();
q.outFields = ["areaname", "pop2000"];
const { features } = await layer.queryFeatures(q);
```

### Impact

Measured: `createQuery().outFields` was `["*"]` and all 6 fields came back. Layer `outFields` only decide what the
view loads for drawing, hit tests and popups.

### Diagnosis

Wide payloads from queries even though the layer lists few fields; set `outFields` on the query.

---

## Pitfall 2: Unbounded queries

### Anti-pattern

```typescript
const { features } = await layer.queryFeatures(); // stops at maxRecordCount, silently
```

### Correct

```typescript
const q = layer.createQuery();
q.where = "region = 'Andes'";
q.num = 2000;
const { features } = await layer.queryFeatures(q);
```

### Impact

Measured on 3557 rows: 1000 came back with `exceededTransferLimit: true` and no error. Code that treats that as
"everything" undercounts.

### Diagnosis

A round number of results (1000, 2000); check `exceededTransferLimit` and page or filter.

---

## Pitfall 3: Wrong geometry type for the source

### Anti-pattern

```typescript
const layer = new CSVLayer({ url: "data.csv" }); // columns are "norte" and "este"
```

### Correct

```typescript
const layer = new CSVLayer({ url: "data.csv", latitudeField: "norte", longitudeField: "este" });
```

### Impact

Measured: `load()` rejects with "Unable to identify latitude and longitude fields from the CSV file". Common names
(`lat`/`lon`, `latitude`/`longitude`) are detected without declaring them.

### Diagnosis

That load error; set `latitudeField`/`longitudeField`.

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

Measured: no error, and nothing changed: `map.layers.getItemAt(0)` was still the old layer and the new one was not
in the collection. A `Collection` is not an array.

### Diagnosis

Layer swap has no visible effect; use Collection methods.

---

## Pitfall 5: Ignoring layer load errors

### Anti-pattern

```typescript
map.add(new FeatureLayer({ url })); // bad URL: one console error, nothing in the UI
```

### Correct

```typescript
const layer = new FeatureLayer({ url });
try { await layer.load(); } catch (e) { console.error("Layer failed", e); }
map.add(layer);
```

### Impact

Measured with a layer id that does not exist: `loadStatus` became `"failed"` with a `loadError`, the console got one
error, and `view.whenLayerView(layer)` was still pending after 10 s. Code awaiting it hangs.

### Diagnosis

`await layer.load()` throws with the real reason (auth, CORS, bad URL).
