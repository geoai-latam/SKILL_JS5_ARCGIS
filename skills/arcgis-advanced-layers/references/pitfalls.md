# Extended Pitfalls: Advanced Layers

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Wrong WMS sublayer name

### Anti-pattern

```typescript
new WMSLayer({ url, sublayers: [{ name: "states" }] }); // missing workspace prefix
```

### Correct

```typescript
new WMSLayer({ url, sublayers: [{ name: "topp:states" }] });
```

### Impact

The WMS returns an empty/missing-layer error.

### Diagnosis

Check GetCapabilities for the exact layer name (often `workspace:layer`).

---

## Pitfall 2: Assuming WFS supports every CRS

### Anti-pattern

```typescript
new WFSLayer({ url }); // server may not offer the view's spatial reference
```

### Correct

```typescript
// Match the view spatialReference to one the WFS advertises, or reproject.
```

### Impact

Features misalign or the layer fails when the CRS is unsupported.

### Diagnosis

Compare the WFS capabilities CRS list with the view's `spatialReference`.

---

## Pitfall 3: KML with relative network links

### Anti-pattern

```typescript
new KMLLayer({ url: "site.kml" }); // relative NetworkLinks may not resolve
```

### Correct

```typescript
new KMLLayer({ url: "https://host/site.kml" }); // absolute, CORS-enabled
```

### Impact

Linked content fails to load; parts of the KML are missing.

### Diagnosis

Network tab shows failed sub-requests for KML NetworkLinks.

---

## Pitfall 4: Styling a MapImageLayer like a FeatureLayer

### Anti-pattern

```typescript
layer.renderer = renderer; // MapImageLayer renders server-side
```

### Correct

```typescript
const sub = layer.findSublayerById(0);
if (sub) sub.renderer = renderer; // client-side override per sublayer
```

### Impact

Setting a renderer on the layer (not the sublayer) has no effect.

### Diagnosis

No visual change after assigning `layer.renderer`; move it to the sublayer.

---

## Pitfall 5: Not awaiting CatalogLayer load before reading

### Anti-pattern

```typescript
const layer = new CatalogLayer({ url });
console.log(layer.title); // undefined before load
```

### Correct

```typescript
const layer = new CatalogLayer({ url });
await layer.load();
console.log(layer.title);
```

### Impact

Metadata properties are empty until the catalog loads.

### Diagnosis

Properties populate only after `await layer.load()`.
