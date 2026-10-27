# Extended Pitfalls: Editing

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: A field name that is not in the layer

### Anti-pattern

```typescript
await layer.applyEdits({ updateFeatures: [new Graphic({ attributes: { OBJECTID: 1, ESTADO: "x" } })] });
```

### Correct

```typescript
await layer.load();
const known = new Set(layer.fields.map((f) => f.name.toLowerCase()));
const unknown = Object.keys(attrs).filter((k) => !known.has(k.toLowerCase()));
if (unknown.length) throw new Error(`Unknown fields: ${unknown.join(", ")}`);
```

### Impact

Measured with 5.1.27: the result is `ok` and the attribute is simply dropped. Nothing tells you the
value was not saved.

### Diagnosis

The edit "succeeds" but the value never appears when you query the feature again.

---

## Pitfall 2: Deleting an id that does not exist

### Anti-pattern

```typescript
const r = await layer.applyEdits({ deleteFeatures: [{ objectId: 99 }] });
// r.deleteFeatureResults[0].error is null → "deleted"
```

### Correct

```typescript
const ids = [99];
const existing = await layer.queryObjectIds({ objectIds: ids });
await layer.applyEdits({ deleteFeatures: existing.map((id) => ({ objectId: id as number })) });
```

### Impact

Measured: deleting `objectId: 99` in a layer with ids 1 and 2 returns `ok(99)`. A sync process that
counts successful deletes over-reports.

### Diagnosis

Delete counts that do not match the drop in `queryFeatureCount()`.

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
// For all-or-nothing on a service: applyEdits(edits, { rollbackOnFailureEnabled: true })
```

### Impact

Measured: with one valid and one invalid update in the same call, the valid one is applied and the
other comes back with an error. Partial success leaves inconsistent data if unchecked.

### Diagnosis

Some features missing after a bulk edit; inspect per-result errors.
