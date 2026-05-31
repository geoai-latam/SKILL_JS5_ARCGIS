# Extended Pitfalls: Custom Rendering

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Leaving WebGL state dirty

### Anti-pattern

```typescript
// Changing blend/depth state without restoring it
```

### Correct

```typescript
// Save and restore GL state around your draw calls.
```

### Impact

The SDK's own rendering breaks after your pass.

### Diagnosis

Scene renders wrong after the custom pass; restore state.

---

## Pitfall 2: Ignoring devicePixelRatio

### Anti-pattern

```typescript
gl.viewport(0, 0, cssWidth, cssHeight);
```

### Correct

```typescript
// Account for devicePixelRatio when sizing buffers/viewport.
```

### Impact

Blurry or mis-sized output on HiDPI.

### Diagnosis

Fuzzy custom visuals; scale by DPR.

---

## Pitfall 3: Heavy work on the render thread

### Anti-pattern

```typescript
render() { doExpensiveCPUWork(); }
```

### Correct

```typescript
// Precompute off the render path; keep render() tight.
```

### Impact

Frame drops.

### Diagnosis

Low FPS during custom rendering; move work out of `render`.

---

## Pitfall 4: Not handling context loss

### Anti-pattern

```typescript
// Assuming GL resources survive a context loss
```

### Correct

```typescript
// Recreate resources on context restore.
```

### Impact

Blank/broken visuals after context loss.

### Diagnosis

Custom visuals vanish after GPU hiccup; handle restore.

---

## Pitfall 5: Mismatched coordinate transforms

### Anti-pattern

```typescript
// Using a stale camera/transform from a previous frame
```

### Correct

```typescript
// Read the current camera/transform each render.
```

### Impact

Geometry lags or drifts during navigation.

### Diagnosis

Custom geometry swims while panning; use current transforms.
