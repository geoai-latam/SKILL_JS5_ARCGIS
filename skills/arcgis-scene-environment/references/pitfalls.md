# Extended Pitfalls: Scene Environment

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Date without time zone awareness

### Anti-pattern

```typescript
lighting: { type: "sun", date: new Date("2026-06-21") }; // local midnight
```

### Correct

```typescript
lighting: { type: "sun", date: new Date(Date.UTC(2026, 5, 21, 18)) };
```

### Impact

Sun position is off (e.g. night when you wanted noon).

### Diagnosis

Lighting looks wrong for the hour; build the date in UTC.

---

## Pitfall 2: Shadows without ground/objects

### Anti-pattern

```typescript
// Shadows enabled but nothing 3D to cast/receive them
```

### Correct

```typescript
// Add 3D layers and ground so shadows are visible.
```

### Impact

No visible shadows.

### Diagnosis

Shadows "missing"; ensure 3D content + ground.

---

## Pitfall 3: Weather expected to affect data

### Anti-pattern

```typescript
// Assuming rainy weather changes layer values
```

### Correct

```typescript
// Weather is visual only; drive data changes separately.
```

### Impact

Confusion between visuals and data.

### Diagnosis

Data unchanged by weather; that's expected.

---

## Pitfall 4: Atmosphere hiding content at horizon

### Anti-pattern

```typescript
atmosphereEnabled: true; // heavy haze obscures distant features
```

### Correct

```typescript
// Tune camera/atmosphere; disable atmosphere for analytical clarity.
```

### Impact

Distant features washed out.

### Diagnosis

Hazy horizon; adjust or disable atmosphere.

---

## Pitfall 5: Animating the sun every frame

### Anti-pattern

```typescript
setInterval(() => { view.environment.lighting.date = nextDate(); }, 16);
```

### Correct

```typescript
// Step the sun a few times per second, not every frame.
```

### Impact

Unnecessary re-rendering cost.

### Diagnosis

High GPU during sun animation; reduce the rate.
