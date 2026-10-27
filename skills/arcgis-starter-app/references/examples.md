# Examples: Starter App

## Example 1: Vanilla TS entry point

**Use case:** the `src/main.ts` that `scaffold.sh` generates.

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@esri/calcite-components/dist/components/calcite-shell";
import esriConfig from "@arcgis/core/config.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Notes:**

- Only import the components you use; the bundler tree-shakes the rest.
- The `<arcgis-map>` element lives in `index.html`.

---

## Example 2: React 19 integration

**Use case:** render a map in a React 19 component using the custom element directly.

```tsx
import "@arcgis/map-components/components/arcgis-map";

export function MapPane() {
  return (
    <arcgis-map
      basemap="arcgis/topographic"
      center="-74.08,4.6"
      zoom={11}
      onarcgisViewReadyChange={(e: CustomEvent) => console.log(e.detail.view)}
    />
  );
}
```

**Notes:**

- React 19 supports custom elements and their events natively — no wrapper package.
- Add the element to JSX intrinsic types if your tsconfig is strict about unknown tags.

---

## Example 3: Angular standalone integration

**Use case:** allow custom elements in an Angular standalone component.

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "@arcgis/map-components/components/arcgis-map";

@Component({
  selector: "app-map",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11"></arcgis-map>`,
})
export class MapComponent {}
```

**Notes:**

- `CUSTOM_ELEMENTS_SCHEMA` stops Angular from erroring on the `<arcgis-*>` tags.
- Import Calcite/component CSS once at the app root.
