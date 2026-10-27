# Extended Pitfalls: Tables & Forms

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis. Measured on SDK 5.1.27 with
> `tests/runtime/casos/arcgis-tables-forms.ts`.

## Pitfall 1: Using the deprecated widgets in a new app

### Anti-pattern

```typescript
import FeatureTable from "@arcgis/core/widgets/FeatureTable.js"; // deprecated since 5.0
```

### Correct

```typescript
import "@arcgis/map-components/components/arcgis-feature-table";
```

### Impact

Building on widgets the SDK types mark `@deprecated since version 5.0`; the same holds for `FeatureForm`.

### Diagnosis

Imports from `@arcgis/core/widgets/FeatureTable.js` or `FeatureForm.js`; move to the components.

---

## Pitfall 2: Calling submit() and expecting the edit to be saved

### Anti-pattern

```typescript
await formEl.submit(); // validates; nothing is written
```

### Correct

```typescript
formEl.addEventListener("arcgisSubmit", async (e) => {
  const { invalid, values } = e.detail;
  if (invalid.length) return;
  const updated = formEl.feature!.clone();
  Object.assign(updated.attributes, values);
  await formEl.layer!.applyEdits({ updateFeatures: [updated] });
});
await formEl.submit();
```

### Impact

Measured: `submit()` fires `arcgisSubmit` with `valid`, `invalid` (field names) and `values`, and nothing else
happens. Edits stay client-side and are lost on reload.

### Diagnosis

Changes disappear after refresh and the network tab shows no `applyEdits` request.

---

## Pitfall 3: Filtering the table by changing the layer

### Anti-pattern

```typescript
layer.definitionExpression = "st = 'CA'"; // also hides the other states on the map
```

### Correct

```typescript
tableEl.definitionExpression = "st = 'CA'"; // the table only
```

### Impact

Measured on USA cities: the table went from 3557 to 446 rows and `layer.definitionExpression` stayed `null`. Changing
the layer instead filters the map as well, which is rarely what a table filter means.

### Diagnosis

Features vanish from the map when the user filters the table.

---

## Pitfall 4: Expecting a table to need manual paging

### Anti-pattern

```typescript
const all = await layer.queryFeatures({ where: "1=1", outFields: ["*"] }); // capped by maxRecordCount
```

### Correct

```typescript
tableEl.layer = layer; // the table fetches pages of pageSize (50) as the user scrolls
```

### Impact

Measured: bound to a layer with `maxRecordCount` 1000, the table reported `size` 3557 and fetches the rest by
scrolling, page by page. A single query for everything stops at the cap and drops rows.

### Diagnosis

A hand-built grid that stops at 1000 or 2000 rows.

---

## Pitfall 5: Assuming relationships exist

### Anti-pattern

```typescript
const rel = layer.relationships![0]; // undefined on a layer without relationships
const query = new RelationshipQuery({ relationshipId: rel.id, objectIds: [1] });
```

### Correct

```typescript
await layer.load();
const rel = layer.relationships?.[0];
const query = rel ? new RelationshipQuery({ relationshipId: rel.id, objectIds: [1] }) : null;
```

### Impact

Measured on USA cities: `relationships` is `[]` and `relationships[0].id` throws
`Cannot read properties of undefined (reading 'id')`.

### Diagnosis

That TypeError; guard the array.
