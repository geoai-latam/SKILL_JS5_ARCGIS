# Extended Pitfalls: Imagery

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Ignoring pixel type / value ranges

### Anti-pattern

```typescript
// Symbolizing raw 16-bit imagery without a stretch
```

### Correct

```typescript
// Apply a Stretch raster function or set a renderer with the right range.
```

### Impact

All-black or washed-out display.

### Diagnosis

Flat imagery; add a stretch/rendering rule.

---

## Pitfall 2: Forgetting auth on secured ImageServer

### Anti-pattern

```typescript
new ImageryLayer({ url: securedImageServer }); // no token
```

### Correct

```typescript
// Set esriConfig.apiKey or sign in for secured services.
```

### Impact

Tiles/exports return 403.

### Diagnosis

Auth errors; see `arcgis-authentication`.

---

## Pitfall 3: Chaining raster functions incorrectly

### Anti-pattern

```typescript
new RasterFunction({ functionName: "Hillshade", functionArguments: { /* no Raster */ } });
```

### Correct

```typescript
new RasterFunction({ functionName: "Hillshade", functionArguments: { Raster: baseFunction } });
```

### Impact

The chain doesn't apply to the intended raster.

### Diagnosis

Unexpected output; pass the upstream function as `Raster`.

---

## Pitfall 4: Querying pixels without identify

### Anti-pattern

```typescript
// Expecting feature-style queries on imagery
```

### Correct

```typescript
// Use layer.identify(point) to read pixel values.
```

### Impact

No feature query API for pixels.

### Diagnosis

Method missing; use `identify`.

---

## Pitfall 5: Huge extents at full resolution

### Anti-pattern

```typescript
// Requesting full-resolution imagery across a continent
```

### Correct

```typescript
// Respect scale; let the service downsample at small scales.
```

### Impact

Slow, heavy requests.

### Diagnosis

Long image loads at low zoom; rely on service pyramids.
