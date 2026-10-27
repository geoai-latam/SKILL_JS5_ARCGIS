# Extended Pitfalls: Custom Rendering

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Allocating GL resources every frame

### Anti-pattern

```typescript
const Node = RenderNode.createSubclass({
  consumes: { required: ["composite-color"] }, produces: "composite-color",
  render() { const buf = this.gl.createBuffer(); /* ... */ return this.bindRenderTarget(); },
});
```

### Correct

```typescript
let buf: WebGLBuffer | null = null;
const Node = RenderNode.createSubclass({
  consumes: { required: ["composite-color"] }, produces: "composite-color",
  render() { buf ??= this.gl.createBuffer(); /* ... */ return this.bindRenderTarget(); },
  destroy() { if (buf) this.gl.deleteBuffer(buf); },
});
```

### Impact

GPU memory grows on every redraw.

### Diagnosis

Memory in the browser's task manager grows while the camera moves.

---

## Pitfall 2: Leaving WebGL state changed

### Anti-pattern

```typescript
gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); // and never restored
```

### Correct

```typescript
// Restore what you changed, or call this.resetWebGLState() at the end of render().
```

### Impact

The SDK documentation warns that improper GL use can break the SceneView's own rendering.
Measured with 5.1.27: leaving `SCISSOR_TEST` enabled with a 1×1 box did **not** break it (the
scene kept rendering normally while the camera turned), so the engine restores at least some
state. Do not rely on it for blend, depth, or bound programs.

### Diagnosis

The scene renders wrong only while your node exists.

---

## Pitfall 3: Raw float32 coordinates in a global scene

### Anti-pattern

```typescript
const verts = new Float32Array(ecef); // ECEF values are ~6.4 million
```

### Correct

```typescript
// Subtract a local origin in Float64 first, then convert the small offsets to Float32,
// and apply the origin with renderCoordinateTransformAt(view, origin).
```

### Impact

Float32 has ~7 significant digits: at 6.4 × 10⁶ m that is a step of about 0.5 m, and the
geometry jitters when you zoom in.

### Diagnosis

Geometry is right from far away and wobbles up close.

---

## Pitfall 4: Expecting continuous frames

### Anti-pattern

```typescript
// Animation driven by time inside render(), with no requestRender()
```

### Correct

```typescript
// Call this.requestRender() from render() while the animation runs.
```

### Impact

Measured: `render` runs while the scene settles and when something changes, then stops while the
camera is still. The animation freezes.

### Diagnosis

The effect moves only while you pan or zoom.

---

## Pitfall 5: Requiring an input that is not always there

### Anti-pattern

```typescript
const consumes = { required: ["composite-color", "highlights"] };
```

### Correct

```typescript
const consumes = { required: ["composite-color"], optional: ["highlights"] };
```

### Impact

With nothing highlighted, `highlights` is missing and the node is skipped for the frame (per the
5.1 typings): the effect disappears.

### Diagnosis

The effect shows only when something is selected.
