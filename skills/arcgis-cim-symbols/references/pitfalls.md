# Extended Pitfalls: CIM Symbols

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Geometry outside the frame

### Anti-pattern

```typescript
frame: { xmin: 0, ymin: 0, xmax: 16, ymax: 16 };
// geometry rings using coordinates like 100
```

### Correct

```typescript
// Keep ring coordinates within the frame bounds (0..16 here).
```

### Impact

The marker graphic is clipped or invisible.

### Diagnosis

Nothing renders; verify ring coordinates fit the frame.

---

## Pitfall 2: Reusing one CIMSymbol instance across layers

### Anti-pattern

```typescript
layerA.renderer = new SimpleRenderer({ symbol });
layerB.renderer = new SimpleRenderer({ symbol }); // shared mutable symbol
```

### Correct

```typescript
layerA.renderer = new SimpleRenderer({ symbol: symbol.clone() });
layerB.renderer = new SimpleRenderer({ symbol: symbol.clone() });
```

### Impact

Editing one renderer's symbol unexpectedly changes the other.

### Diagnosis

Symbol edits leak between layers; clone before sharing.

---

## Pitfall 3: Expecting size in pixels for every layer

### Anti-pattern

```typescript
// Assuming nested marker sizes are pixels
```

### Correct

```typescript
// Vector marker sizes are relative to the frame; the outer size scales them.
```

### Impact

Markers render larger/smaller than expected.

### Diagnosis

Scale looks off; remember frame-relative sizing.

---

## Pitfall 4: Forgetting CIM symbols are heavier

### Anti-pattern

```typescript
// Thousands of complex CIM symbols on a dense point layer
```

### Correct

```typescript
// Use simple symbols for dense layers; reserve CIM for emphasis features.
```

### Impact

Render cost rises with CIM complexity on large datasets.

### Diagnosis

Frame drops on dense layers using CIM; simplify or reduce features.

---

## Pitfall 5: Hand-editing CIM without a schema reference

### Anti-pattern

```typescript
// Guessing field names in the CIM JSON
```

### Correct

```typescript
// Author in ArcGIS Pro / the symbol builder, then export the CIM JSON.
```

### Impact

Typos in CIM keys silently disable layers.

### Diagnosis

Layer missing; validate against the CIM spec or re-export from a tool.
