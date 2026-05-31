---
name: {{name}}
description: >
  TODO reemplazar: descripción de un párrafo de {{name}} para el ArcGIS Maps SDK
  for JavaScript 5.0. Explica qué construye el desarrollador con ella, qué APIs o
  componentes cubre, y cuándo un agente debe activarla. Mantenla entre 50 y 200
  tokens. Usa esta skill cuando el usuario trabaje en el dominio {{name}} dentro
  de una aplicación web de mapas.
lang: es
version: 0.1.0
status: beta
sdk_version: ">=5.0 <6.0"
created: {{date}}
updated: {{date}}
category: {{category}}
tags:
  - arcgis
  - sdk-5
  - {{slug}}
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# {{display}}

> **Cuándo usar:** Activa esta skill cuando el usuario TODO describe el contexto del trigger.

## Resumen

TODO 2-3 párrafos.

- Qué problema resuelve.
- A qué persona técnica sirve.
- El patrón fundamental que enseña.
- Qué NO cubre (delega a otra skill si aplica).

## Inicio Rápido

```typescript
// TODO snippet mínimo ejecutable.
import Map from "@arcgis/core/Map.js";

const map = new Map({ basemap: "topo-vector" });
export { map };
```

## Árbol de Decisión

1. **TODO pregunta de bifurcación?**
   - Sí → opción A (razón).
   - No → opción B (razón).

**Default:** opción A salvo razón explícita para B.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import Map from "@arcgis/core/Map.js";
```

### Imports Dinámicos (CDN)

```javascript
const Map = await $arcgis.import("@arcgis/core/Map.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: TODO

TODO 1-2 párrafos.

### Concepto 2: TODO

TODO 1-2 párrafos.

### Concepto 3: TODO

TODO 1-2 párrafos.

## Pitfalls Comunes (Top 3)

### Pitfall 1: TODO

```typescript
// ❌ Anti-patrón
// TODO
```

```typescript
// ✅ Correcto
// TODO
```

**Impacto:** TODO síntoma observable.

### Pitfall 2: TODO

```typescript
// ❌ Anti-patrón
// TODO
```

```typescript
// ✅ Correcto
// TODO
```

**Impacto:** TODO síntoma observable.

### Pitfall 3: TODO

```typescript
// ❌ Anti-patrón
// TODO
```

```typescript
// ✅ Correcto
// TODO
```

**Impacto:** TODO síntoma observable.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas completas de la API | `references/api-detail.md` |
| Ejemplos end-to-end | `references/examples.md` |
| Más pitfalls (5+) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — TODO por qué
- `arcgis-starter-app` — TODO por qué

## Samples de Referencia

- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)

## Changelog

- **0.1.0** ({{date}}): Borrador inicial.
