# Extended Pitfalls: Time & Animation

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Slider with no fullTimeExtent

### Anti-pattern

```html
<arcgis-time-slider></arcgis-time-slider> <!-- no time-aware layer -->
```

### Correct

```html
<!-- Ensure a time-aware layer (or set fullTimeExtent) so the slider has a range. -->
```

### Impact

The slider is empty/disabled.

### Diagnosis

Blank slider; verify a time-aware layer/extent.

---

## Pitfall 2: Not clearing the animation interval

### Anti-pattern

```typescript
setInterval(step, 500); // never cleared
```

### Correct

```typescript
const id = setInterval(step, 500);
// clearInterval(id) on teardown
```

### Impact

Animation keeps running after unmount.

### Diagnosis

CPU stays busy; clear the interval.

---

## Pitfall 3: timeInfo fields wrong/missing

### Anti-pattern

```typescript
layer.timeInfo = { startField: "date" }; // field is START_DATE
```

### Correct

```typescript
layer.timeInfo = { startField: "START_DATE" };
```

### Impact

No filtering because the field doesn't exist.

### Diagnosis

Time filter ignored; verify field names.

---

## Pitfall 4: Over-fine slider stops

### Anti-pattern

```typescript
// Thousands of slider stops over a long range
```

### Correct

```typescript
// Use a sensible interval (e.g. monthly) for the range.
```

### Impact

Janky slider and animation.

### Diagnosis

Sluggish slider; coarsen stops.

---

## Pitfall 5: Assuming server time zone equals user's

### Anti-pattern

```typescript
// Displaying raw times without considering the layer's time zone
```

### Correct

```typescript
// Account for the layer/timeInfo time zone when labeling.
```

### Impact

Misleading timestamps.

### Diagnosis

Times look shifted; reconcile time zones.
