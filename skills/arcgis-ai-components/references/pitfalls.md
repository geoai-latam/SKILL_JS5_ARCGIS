# Extended Pitfalls: AI Components (Beta)

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Assuming agent actions are deterministic

### Anti-pattern

```typescript
// Relying on the assistant to always perform the exact same action
```

### Correct

```typescript
// Treat agent actions as assistive; validate critical outcomes.
```

### Impact

Unexpected behavior for critical workflows.

### Diagnosis

Inconsistent results; add validation/confirmation.

---

## Pitfall 2: No loading/cost awareness

### Anti-pattern

```typescript
// Heavy agent calls with no feedback or rate limits
```

### Correct

```typescript
// Show progress and consider request limits/costs.
```

### Impact

Slow UX and runaway usage.

### Diagnosis

Laggy assistant; add feedback and limits.

---

## Pitfall 3: Mixing incompatible package versions

### Anti-pattern

```typescript
// ai-components beta on a different SDK minor than core
```

### Correct

```typescript
// Keep ai-components aligned with the SDK version.
```

### Impact

Runtime/type mismatches.

### Diagnosis

Component errors; align versions.

---

## Pitfall 4: Ignoring accessibility of the chat UI

### Anti-pattern

```typescript
// Custom styling that breaks keyboard/screen-reader access
```

### Correct

```typescript
// Preserve the component's accessibility affordances.
```

### Impact

Inaccessible assistant.

### Diagnosis

A11y audit failures; keep built-in semantics.

---

## Pitfall 5: Shipping beta without a fallback

### Anti-pattern

```typescript
// Core workflow depends entirely on the beta assistant
```

### Correct

```typescript
// Provide non-AI paths for essential tasks.
```

### Impact

Broken workflows if the beta changes/breaks.

### Diagnosis

Single point of failure; add fallbacks.
