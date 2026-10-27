# Extended Pitfalls: Starter App

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured on 2026-10-27 by running `scripts/scaffold.sh` and `tests/runtime/casos/arcgis-starter-app.ts`.

## Pitfall 1: Wrong moduleResolution

### Anti-pattern

```jsonc
{ "compilerOptions": { "moduleResolution": "node" } }
```

### Correct

```jsonc
{ "compilerOptions": { "moduleResolution": "bundler" } }
```

### Impact

Measured: TypeScript 7 rejects the option outright (`TS5108: Option 'moduleResolution=node10' has been removed`).
On TypeScript 5.9 the build passes until you import a type from map-components, then
`TS2307: Cannot find module '@arcgis/map-components/components/arcgis-map'` (subpath exports do not resolve).

### Diagnosis

Either error; switch to `"bundler"` (or `"node16"`).

---

## Pitfall 2: Missing container height

### Anti-pattern

```html
<arcgis-map basemap="osm"></arcgis-map>
```

### Correct

```html
<style>html, body, arcgis-map { margin: 0; height: 100%; }</style>
<arcgis-map basemap="osm"></arcgis-map>
```

### Impact

Measured: the element was 0 px tall and `viewOnReady()` was still pending after 15 s, so any code awaiting it never
runs.

### Diagnosis

Element height is 0 in dev tools.

---

## Pitfall 3: Pinning Calcite to 3.x

### Anti-pattern

```bash
pnpm add @esri/calcite-components@^3.3
```

### Correct

```bash
pnpm add @esri/calcite-components@^5.1
```

### Impact

`@arcgis/core` and `@arcgis/map-components` 5.1.27 declare `@esri/calcite-components` `^5.1.1`: a 3.x install is a
second, incompatible copy. With `^5.1` the scaffold resolved a single 5.2.0.

### Diagnosis

Two Calcite versions in `pnpm why @esri/calcite-components`.

---

## Pitfall 4: Forgetting the VITE_ prefix

### Anti-pattern

```bash
ARCGIS_API_KEY=xxxx   # not exposed to the client
```

### Correct

```bash
VITE_ARCGIS_API_KEY=xxxx
```

### Impact

`import.meta.env.VITE_ARCGIS_API_KEY` is `undefined`; measured, assigning that leaves `esriConfig.apiKey`
`undefined`, and `arcgis/*` basemaps fall back to a sign-in dialog.

### Diagnosis

The scaffold's `main.ts` warns in the console when the key is empty.

---

## Pitfall 5: Adding the React wrapper on React 19

### Anti-pattern

```typescript
import { ArcgisMap } from "@arcgis/map-components-react";
```

### Correct

```typescript
import "@arcgis/map-components/components/arcgis-map"; // the custom element + onarcgis* event props
```

### Impact

`@arcgis/map-components-react` 5.1.27 is still published (not marked deprecated on npm), but React 19 handles
custom elements and their events natively, so it is an extra dependency to keep in step.

### Diagnosis

`@arcgis/map-components-react` in a React 19 `package.json`.
