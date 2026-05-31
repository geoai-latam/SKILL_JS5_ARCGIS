# Extended Pitfalls: Arcade

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Field name case in expressions

### Anti-pattern

```text
$feature.pop  // field is POP
```

### Correct

```text
$feature.POP
```

### Impact

Returns null/undefined values.

### Diagnosis

Blank computed output; match the field case.

---

## Pitfall 2: Returning the wrong type for the context

### Anti-pattern

```text
// Label expression returning a number where text is expected
$feature.POP
```

### Correct

```text
Text($feature.POP)
```

### Impact

Type coercion surprises in labels.

### Diagnosis

Odd label formatting; wrap with `Text()`.

---

## Pitfall 3: Division by zero

### Anti-pattern

```text
$feature.POP / $feature.AREA  // AREA may be 0
```

### Correct

```text
IIf($feature.AREA == 0, 0, $feature.POP / $feature.AREA)
```

### Impact

Infinity/NaN in output.

### Diagnosis

Weird density values; guard the denominator.

---

## Pitfall 4: Assuming geometry is available

### Anti-pattern

```text
Area($feature)  // geometry not returned by the query
```

### Correct

```text
// Ensure returnGeometry / the profile provides geometry.
```

### Impact

Geometry functions fail without geometry.

### Diagnosis

Null geometry errors; return geometry.

---

## Pitfall 5: Expensive data functions per feature

### Anti-pattern

```text
FeatureSetByName($map, "Other") // called for every feature
```

### Correct

```text
// Precompute or restructure; avoid heavy data access per feature.
```

### Impact

Severe slowdowns at scale.

### Diagnosis

Lag rendering labels/renderers; remove heavy data calls.
