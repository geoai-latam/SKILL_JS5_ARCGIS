---
name: arcgis-performance
description: >
  Optimiza apps con ArcGIS Maps SDK for JavaScript 5.0: reduce el bundle con
  imports ESM por módulo y dynamic import(), baja el trabajo de dibujo con feature
  reduction y visibilidad de capas, y evita fugas de memoria destruyendo vistas y
  removiendo handles de watch. Usa esta skill cuando el usuario reporte un mapa
  lento, un bundle grande, jank al navegar, o crecimiento de memoria con el tiempo.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - performance
  - bundle
  - lazy-loading
  - memory
  - optimization
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Rendimiento

> **Cuándo usar:** Activa esta skill cuando el usuario reporte un mapa lento, un bundle grande,
> jank al navegar/zoom, o crecimiento de memoria, y quiera optimizaciones concretas.

## Resumen

El rendimiento en el SDK viene de tres palancas: enviar menos código, dibujar menos, y limpiar.

- **Problema que resuelve:** cargas lentas, bundles pesados, y fugas en SPAs de larga vida.
- **A quién sirve:** desarrolladores afinando una app funcional para producción.
- **Patrón que enseña:** imports ESM granulares, lazy loading, feature reduction, limpieza determinista.
- **Qué NO cubre:** el setup inicial (ver `arcgis-starter-app`) ni decisiones de render (`arcgis-visualization`).

## Inicio Rápido

```typescript
// Carga diferida de una capa pesada solo cuando se necesita (la separa del bundle principal).
const { default: CSVLayer } = await import("@arcgis/core/layers/CSVLayer.js");
map.add(new CSVLayer({ url }));
```

## Árbol de Decisión

1. **¿El bundle es muy grande?**
   - Sí → importa por módulo (`@arcgis/core/<x>.js`), dynamic-import de features pesadas/opcionales.
   - No → continúa.

2. **¿El render hace jank con muchas features?**
   - Sí → activa feature reduction (clustering), ajusta `definitionExpression`, baja el quality profile (3D).
   - No → continúa.

3. **¿La memoria crece entre navegaciones?**
   - Sí → `view.destroy()` y `handle.remove()` en el teardown.

**Default:** importa granular, difiere el resto, siempre limpia.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

### Imports Dinámicos (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Importa solo los componentes que renderizas para que el bundler haga tree-shaking del resto.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Imports granulares y code-splitting

Importa desde rutas de módulo específicas para que los bundlers hagan tree-shaking del código no
usado. Envuelve features opcionales o pesadas en `await import(...)` para que caigan en un chunk
separado cargado bajo demanda.

### Concepto 2: Dibujar menos

Usa feature reduction (clustering), `definitionExpression` para limitar features traídas, y
`maxScale`/`minScale` para que las capas dibujen solo donde importan. En 3D baja `qualityProfile`.

### Concepto 3: Limpieza determinista

Las SPAs de larga vida fugan si las vistas y handles persisten. Llama `view.destroy()` y
`handle.remove()` por cada watch cuando una ruta se desmonta.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Importar todo el namespace

```typescript
// ❌ Anti-patrón
import * as arcgis from "@arcgis/core"; // trae mucho más de lo que usas
```

```typescript
// ✅ Correcto
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

**Impacto:** el bundle se infla y la carga inicial es lenta.

### Pitfall 2: Nunca destruir vistas

```typescript
// ❌ Anti-patrón
function leaveRoute() { container.innerHTML = ""; } // el objeto view sigue vivo
```

```typescript
// ✅ Correcto
function leaveRoute() { view.destroy(); }
```

**Impacto:** contextos WebGL y memoria se acumulan ("Too many active WebGL contexts").

### Pitfall 3: Renderizar todas las features sin reducción

```typescript
// ❌ Anti-patrón
const layer = new FeatureLayer({ url }); // 200k puntos, sin reducción
```

```typescript
// ✅ Correcto
const layer = new FeatureLayer({ url, featureReduction: { type: "cluster" } });
```

**Impacto:** frames perdidos y alto GPU/CPU al navegar datos densos.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Propiedades/APIs de rendimiento | `references/api-detail.md` |
| Ejemplos de bundle, clustering, cleanup | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-starter-app` — configura el build primero
- `arcgis-core-utilities` — patrones de limpieza de handles
- `arcgis-visualization` — feature reduction y renderers

## Samples de Referencia

- [Optimize performance](https://developers.arcgis.com/javascript/latest/optimizing-performance/)
- [Clustering](https://developers.arcgis.com/javascript/latest/sample-code/featurereduction-cluster/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
