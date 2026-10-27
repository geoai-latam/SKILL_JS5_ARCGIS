# Extended Pitfalls: Charts

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Reaching for the package index or the `.js` path for `createModel`

### Anti-pattern

```typescript
// ❌ Anti-pattern: both fail in 5.1 (index deprecated, ".js" not in the export map)
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils.js";
```

### Correct

```typescript
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils";
```

### Impact

Vite stops with "Missing specifier" for the `.js` path (measured with 5.1.27); the package-index
import works today and disappears in 6.0.

### Diagnosis

Build error naming `setup-utils.js`: drop the extension.

---

## Pitfall 2: A model field that the layer does not have

### Anti-pattern

```typescript
// ❌ Anti-pattern
model.xAxisField = "Type"; // the layer field is "TYPE_CODE"
```

### Correct

```typescript
await layer.load();
const field = layer.getField("TYPE_CODE");
if (!field) throw new Error("the chart field is not on the layer");
model.xAxisField = field.name;
```

### Impact

The chart queries a field that does not exist and draws nothing; nothing tells the user why.

### Diagnosis

Listen to `arcgisRuntimeError`, and check the name with `layer.getField()` before setting it.

---

## Pitfall 3: Too many categories

### Anti-pattern

```typescript
// A bar chart with hundreds of distinct categories
```

### Correct

```typescript
// Group small categories into "Other" or filter.
```

### Impact

Unreadable, cramped chart.

### Diagnosis

Overcrowded axis; reduce categories.

---

## Pitfall 4: Ignoring null/empty values

### Anti-pattern

```typescript
// Plotting a value field with many nulls
```

### Correct

```typescript
// Filter nulls (definitionExpression) or handle them in aggregation.
```

### Impact

Skewed or broken charts.

### Diagnosis

Gaps/zeros; filter nulls.

---

## Pitfall 5: Not styling for the container size

### Anti-pattern

```typescript
// Chart in a zero-height container
```

### Correct

```typescript
// Give the chart element an explicit size.
```

### Impact

The chart collapses or overflows.

### Diagnosis

Invisible/clipped chart; set dimensions.
