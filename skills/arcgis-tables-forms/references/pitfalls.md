# Extended Pitfalls: Tables & Forms

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Forgetting reference-element

### Anti-pattern

```html
<arcgis-feature-table></arcgis-feature-table>
```

### Correct

```html
<arcgis-feature-table reference-element="arcgis-map"></arcgis-feature-table>
```

### Impact

Table selection and map selection do not stay in sync.

### Diagnosis

Clicking a row does not highlight on the map; add `reference-element`.

---

## Pitfall 2: Editable table on a non-editable layer

### Anti-pattern

```typescript
table.editingEnabled = true; // layer has no edit capability
```

### Correct

```typescript
await layer.load();
table.editingEnabled = layer.capabilities?.operations?.supportsUpdate ?? false;
```

### Impact

Edits silently fail because the service does not allow updates.

### Diagnosis

Check `layer.capabilities.operations` before enabling editing.

---

## Pitfall 3: Submitting a form without applying edits

### Anti-pattern

```typescript
// Reading form values but never persisting them
const values = formEl.getValues?.();
```

### Correct

```typescript
const updated = formEl.feature; // grab edited graphic
await layer.applyEdits({ updateFeatures: [updated] });
```

### Impact

Edits stay client-side and are lost on reload.

### Diagnosis

Changes disappear after refresh; call `applyEdits`.

---

## Pitfall 4: Loading huge tables without paging

### Anti-pattern

```typescript
table.layer = hugeLayer; // hundreds of thousands of rows
```

### Correct

```typescript
hugeLayer.definitionExpression = "region = 'Andes'"; // scope it
table.layer = hugeLayer;
```

### Impact

The table is sluggish and memory-heavy.

### Diagnosis

Slow scroll/init; constrain with a definition expression.

---

## Pitfall 5: Assuming relationships exist

### Anti-pattern

```typescript
const rel = layer.relationships[0]; // may be undefined
new RelationshipQuery({ relationshipId: rel.id, objectIds: [id] });
```

### Correct

```typescript
await layer.load();
if (!layer.relationships.length) return [];
const rel = layer.relationships[0];
```

### Impact

A runtime error when the layer has no relationships.

### Diagnosis

`Cannot read properties of undefined (reading 'id')`; guard the array.
