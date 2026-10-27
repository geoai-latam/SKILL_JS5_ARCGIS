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

Nothing errors: `load()` resolves, `loadError` is `null`, and the map draws nothing for that
sublayer (measured with SDK 5.1.27).

### Diagnosis

Load once without `sublayers` and log `layer.allSublayers.map((s) => s.name)`; GeoServer names
usually carry the workspace (`workspace:layer`), MapServer names do not.

---

## Pitfall 2: Pointing WFSLayer at a WFS the SDK cannot read

### Anti-pattern

```typescript
new WFSLayer({ url: "https://host/geoserver/wfs" }); // WFS 1.1 only, or no GeoJSON output; no `name`
```

### Correct

```typescript
// The server must support WFS 2.0.0 and offer a GeoJSON outputFormat.
new WFSLayer({ url: "https://host/geoserver/wfs", name: "workspace:typename" });
```

### Impact

`load()` rejects ("An error occurred while getting info about the feature type …"). The SDK
documents WFS 2.0.0 + GeoJSON as a hard requirement; many national portals still serve WFS 1.1.

### Diagnosis

Open `?SERVICE=WFS&REQUEST=GetCapabilities&VERSION=2.0.0` and look for an `outputFormat` with
`json`. If there is none, use the portal's OGC API, its WMS, or a proxy that converts.

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

## Pitfall 5: A CatalogLayer on a MapServer, or read before load

### Anti-pattern

```typescript
new CatalogLayer({ url: "https://host/arcgis/rest/services/MyCatalog/MapServer" });
```

### Correct

```typescript
new CatalogLayer({ url: "https://host/arcgis/rest/services/MyCatalog/FeatureServer" });
```

### Impact

Rejected with "There is no Catalog Layer in the service" (measured with SDK 5.1.27).

---

## Pitfall 6: Not awaiting CatalogLayer load before reading

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
