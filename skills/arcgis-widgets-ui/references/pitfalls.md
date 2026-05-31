# Extended Pitfalls: Widgets & UI

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Forgetting the side-effect import

### Anti-pattern

```html
<arcgis-legend></arcgis-legend> <!-- never imported in JS -->
```

### Correct

```typescript
import "@arcgis/map-components/dist/components/arcgis-legend";
```

### Impact

The custom element is not defined, so it renders as an empty tag.

### Diagnosis

Element shows nothing; confirm the import ran.

---

## Pitfall 2: reference-element pointing at the wrong node

### Anti-pattern

```html
<arcgis-search reference-element="#map"></arcgis-search> <!-- id is "myMap" -->
```

### Correct

```html
<arcgis-search reference-element="#myMap"></arcgis-search>
```

### Impact

The component cannot find the view and stays empty.

### Diagnosis

Empty component; verify the selector matches the map id.

---

## Pitfall 3: Expecting widget-only APIs on components

### Anti-pattern

```typescript
legendComponent.someWidgetMethod(); // not all widget APIs are mirrored
```

### Correct

```typescript
// Use the component's documented properties/events.
```

### Impact

Calls fail because the component surface differs from the widget.

### Diagnosis

Method undefined on the element; check the component docs.

---

## Pitfall 4: Styling components without Calcite/CSS loaded

### Anti-pattern

```html
<!-- components present but theme/assets missing -->
```

### Correct

```typescript
import "@arcgis/map-components/dist/components/arcgis-legend"; // pulls needed styles via npm
```

### Impact

Unstyled or icon-less components.

### Diagnosis

Components look broken; ensure assets/styles load (see starter-app).

---

## Pitfall 5: Overlapping positions

### Anti-pattern

```html
<arcgis-legend position="top-right"></arcgis-legend>
<arcgis-search position="top-right"></arcgis-search>
```

### Correct

```html
<arcgis-legend position="bottom-left"></arcgis-legend>
<arcgis-search position="top-right"></arcgis-search>
```

### Impact

Components stack and obscure each other.

### Diagnosis

Overlapping UI; assign distinct positions/slots.
