# Extended Pitfalls: Scene Environment

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 in `tests/runtime/casos/arcgis-scene-environment.ts`.

## Pitfall 1: Dates without an explicit time zone

### Anti-pattern

```typescript
const a = new Date("2026-06-21");       // UTC midnight: 19:00 on 20 June in Bogotá
const b = new Date("2026-06-21T12:00"); // the browser's zone: noon somewhere different for each user
```

### Correct

```typescript
const noonBogota = new Date("2026-06-21T12:00:00-05:00"); // or new Date(Date.UTC(2026, 5, 21, 17))
```

### Impact

Measured: `new Date("2026-06-21")` was stored as `2026-06-21T00:00:00.000Z`, and `"2026-06-21T12:00"` became
`17:00Z` in a Bogotá browser. A date-only string is UTC; a date-time without offset is local.

### Diagnosis

The sun is in the wrong place, or different users see different shadows; write the offset.

---

## Pitfall 2: Assuming the sun starts at "now"

### Anti-pattern

```typescript
new SceneView({ map, environment: { lighting: { type: "sun", directShadowsEnabled: true } } }); // "current shadows"
```

### Correct

```typescript
new SceneView({ map, environment: { lighting: { type: "sun", date: new Date(), directShadowsEnabled: true } } });
```

### Impact

Measured: with no `date`, the sun sat on 15 March at local solar noon under the camera (16:56 UTC over Bogotá).

### Diagnosis

Shadows that never match the clock; pass `date`.

---

## Pitfall 3: Setting environment on a MapView

### Anti-pattern

```typescript
new MapView({ map, environment: { lighting: { type: "sun" } } } as never); // 2D has no environment
```

### Correct

```typescript
new SceneView({ map, environment: { lighting: { type: "sun" } } });
```

### Impact

Measured: no error; the object was kept as a plain property (no `declaredClass`) and did nothing. TypeScript
rejects it, which is why the anti-pattern needs `as never`.

### Diagnosis

Lighting settings with no effect in a 2D app.

---

## Pitfall 4: Weather parameters outside 0–1

### Anti-pattern

```typescript
environment.weather = { type: "snowy", precipitation: 3 }; // "three times the snow"
```

### Correct

```typescript
environment.weather = { type: "snowy", precipitation: 1, snowCover: "enabled" };
```

### Impact

Measured: `precipitation` 3 was clamped to `1`; `cloudCover` stayed at its default `0.5`; `snowCover` defaults to
`"disabled"`.

### Diagnosis

Sliders above 1 that change nothing.

---

## Pitfall 5: Shadows, weather and quality on weak GPUs

### Anti-pattern

```typescript
const scene = new SceneView({ map, qualityProfile: "high",
  environment: { weather: { type: "rainy" }, lighting: { type: "sun", directShadowsEnabled: true } } });
```

### Correct

```typescript
const scene = new SceneView({ map, qualityProfile: "medium" }); // "medium" is the default; "low" also exists
```

### Impact

Frame drops on weak devices (not measured). Measured: `qualityProfile` defaults to `"medium"` and can be changed
after construction.

### Diagnosis

Low frame rate with shadows or weather on; lower the profile or turn one off.
