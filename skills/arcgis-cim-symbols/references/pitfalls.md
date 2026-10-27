# Extended Pitfalls: CIM Symbols

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Geometry outside the frame

### Anti-pattern

```typescript
// ❌ Anti-pattern: a 0..16 frame with a ring that reaches 100
const geometry = { rings: [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]] };
const frame = { xmin: 0, ymin: 0, xmax: 16, ymax: 16 };
```

### Correct

```typescript
// Keep ring coordinates inside the frame (0..16 here), or make the frame fit the geometry.
```

### Impact

The frame does not clip. Measured with 5.1.27: the same marker at `size: 20` paints 27 px with the
geometry inside the frame and 120 px with it outside.

### Diagnosis

A marker far bigger than its `size`: compare ring coordinates with the frame.

---

## Pitfall 2: Reusing one CIMSymbol instance across renderers

### Anti-pattern

```typescript
// ❌ Anti-pattern
layerA.renderer = new SimpleRenderer({ symbol });
layerB.renderer = new SimpleRenderer({ symbol }); // shared mutable symbol
```

### Correct

```typescript
layerA.renderer = new SimpleRenderer({ symbol: symbol.clone() });
layerB.renderer = new SimpleRenderer({ symbol: symbol.clone() });
```

### Impact

Measured: both renderers hold the very same object (`r1.symbol === r2.symbol`), and
`applyCIMSymbolColor` on one recolours the other.

### Diagnosis

Symbol edits leak between layers; clone before sharing.

---

## Pitfall 3: Reading `size` and `width` as pixels

### Anti-pattern

```typescript
// ❌ Anti-pattern: "a 24 px icon"
const marker = { type: "CIMVectorMarker", enable: true, size: 24 };
```

### Correct

```typescript
// CIM sizes are points: 24 px = 18 pt.
const marker = { type: "CIMVectorMarker", enable: true, size: 18 };
```

### Impact

Measured: `size: 20` paints 27 px. Everything comes out a third bigger than designed.

### Diagnosis

Icons larger than the mock-up by 1.33×.

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

## Pitfall 5: Trusting the old "forget `enable: true` and it is not drawn"

### Anti-pattern

```typescript
// ❌ Anti-pattern: debugging an invisible symbol by adding enable: true everywhere
```

### Correct

```typescript
// An omitted enable draws (measured, preview and MapView); only enable: false hides a layer.
// Look instead at: the CIMSymbolReference wrapper, alpha 0–255, geometry vs frame, override case.
```

### Impact

Time lost on a non-cause. Keep `enable: true` anyway: the typings require it.

### Diagnosis

`symbolUtils.renderPreviewHTML(symbol)` on the symbol alone tells whether the JSON paints at all.
