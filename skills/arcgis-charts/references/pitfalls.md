# Extended Pitfalls: Charts

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Setting config before the element is defined

### Anti-pattern

```typescript
chartEl.config = cfg; // element not yet upgraded
```

### Correct

```typescript
import "@arcgis/charts-components/dist/components/arcgis-chart";
customElements.whenDefined("arcgis-chart").then(() => { chartEl.config = cfg; });
```

### Impact

The property is set before the component is ready.

### Diagnosis

Config ignored; wait for the element to be defined.

---

## Pitfall 2: Mismatched fields between config and layer

### Anti-pattern

```typescript
config = { category: { field: "Type" } }; // field is TYPE
```

### Correct

```typescript
config = { category: { field: "TYPE" } };
```

### Impact

Empty chart.

### Diagnosis

No bars/points; match field names exactly.

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
