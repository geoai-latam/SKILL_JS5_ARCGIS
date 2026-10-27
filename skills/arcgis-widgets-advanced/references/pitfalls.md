# Extended Pitfalls: Advanced Widgets

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Print fails without an API key

### Anti-pattern

```typescript
// Using the ArcGIS Online print service with no apiKey
```

### Correct

```typescript
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

### Impact

Export requests are rejected (401).

### Diagnosis

Print returns an auth error; set the API key.

---

## Pitfall 2: Bookmarks empty on a plain map

### Anti-pattern

```html
<arcgis-map basemap="arcgis/topographic"><arcgis-bookmarks></arcgis-bookmarks></arcgis-map>
```

### Correct

```html
<arcgis-map item-id="<webmap-with-bookmarks>"><arcgis-bookmarks></arcgis-bookmarks></arcgis-map>
```

### Impact

No bookmarks show because none are defined.

### Diagnosis

Empty bookmarks list; load a webmap with bookmarks or add at runtime.

---

## Pitfall 3: Elevation profile with no elevation source

### Anti-pattern

```html
<arcgis-scene><arcgis-elevation-profile></arcgis-elevation-profile></arcgis-scene>
```

### Correct

```html
<arcgis-scene ground="world-elevation"><arcgis-elevation-profile></arcgis-elevation-profile></arcgis-scene>
```

### Impact

The profile is flat/empty without ground elevation.

### Diagnosis

Flat profile; set `ground` to an elevation source.

---

## Pitfall 4: Compass with no rotation to reset (2D)

### Anti-pattern

```html
<!-- Compass on a 2D map that never rotates -->
```

### Correct

```html
<!-- Enable rotation or use compass where heading actually changes. -->
```

### Impact

The compass appears inert.

### Diagnosis

Compass does nothing; confirm the view can rotate.

---

## Pitfall 5: Loading all advanced components everywhere

### Anti-pattern

```typescript
import "@arcgis/map-components/components/arcgis-print";
import "@arcgis/map-components/components/arcgis-daylight"; // unused in 2D app
```

### Correct

```typescript
import "@arcgis/map-components/components/arcgis-print"; // only what the page uses
```

### Impact

Unused heavy components inflate the bundle.

### Diagnosis

Bundle analysis shows unused components; import per page.
