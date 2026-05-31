# Extended Pitfalls: Editing

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Geometry in the wrong spatial reference

### Anti-pattern

```typescript
// Adding a feature whose geometry SR differs from the layer's
```

### Correct

```typescript
// Project geometry to the layer's spatialReference before applyEdits.
```

### Impact

The feature lands in the wrong place or the edit is rejected.

### Diagnosis

Misplaced new features; compare geometry SR to the layer's.

---

## Pitfall 2: Not refreshing after edits

### Anti-pattern

```typescript
await layer.applyEdits({ addFeatures }); // UI still shows old state
```

### Correct

```typescript
await layer.applyEdits({ addFeatures });
layer.refresh();
```

### Impact

The map doesn't show new/updated features immediately.

### Diagnosis

Edits succeed server-side but the view lags; call `refresh()`.

---

## Pitfall 3: Editing without authentication

### Anti-pattern

```typescript
await layer.applyEdits({ addFeatures }); // secured service, no sign-in
```

### Correct

```typescript
// Authenticate (OAuth2/IdentityManager) before editing secured services.
```

### Impact

403/token errors on edit.

### Diagnosis

Edit rejected with auth error; see `arcgis-authentication`.

---

## Pitfall 4: Large attachment uploads blocking the UI

### Anti-pattern

```typescript
await layer.addAttachment(feature, hugeForm); // multi-MB photo on main thread
```

### Correct

```typescript
// Resize/compress images client-side before upload; show progress.
```

### Impact

UI stalls during big uploads.

### Diagnosis

Frozen UI on attach; compress and provide feedback.

---

## Pitfall 5: Assuming applyEdits is transactional

### Anti-pattern

```typescript
await layer.applyEdits({ addFeatures: many }); // expecting all-or-nothing
```

### Correct

```typescript
const r = await layer.applyEdits({ addFeatures: many });
// Inspect each result; some may fail while others succeed.
```

### Impact

Partial success leaves inconsistent data if unchecked.

### Diagnosis

Some features missing after a bulk edit; inspect per-result errors.
