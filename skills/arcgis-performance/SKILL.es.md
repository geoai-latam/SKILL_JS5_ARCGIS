---
name: arcgis-performance
description: >
  Optimiza apps del ArcGIS Maps SDK for JavaScript 5.1: desmonta las vistas con
  view.destroy() (sabiendo que también destruye el mapa y las capas), evita los
  watch de alta frecuencia, pinta menos con rangos de escala, feature reduction y
  visibilidad, y ten expectativas honestas del bundle (el SDK ya se divide solo).
  Usa esta skill cuando el usuario reporte un mapa lento, un bundle grande, saltos
  al desplazarse, contextos WebGL perdidos o memoria que crece con el tiempo.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: core
tags:
  - performance
  - bundle
  - lazy-loading
  - memory
  - optimization
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Rendimiento

> **Cuándo usar:** Activa esta skill cuando el usuario reporte un mapa lento, un bundle grande,
> jank al navegar/zoom, o crecimiento de memoria, y quiera optimizaciones concretas.

## Resumen

El rendimiento en el SDK sale de tres palancas: limpiar, pintar menos y enviar menos código. Medido con 5.1.27, las dos
primeras pesan mucho más que la tercera.

- **Problema que resuelve:** contextos WebGL perdidos, fugas en SPAs de larga vida, saltos al desplazarse, cargas lentas.
- **A quién sirve:** desarrolladores que afinan una app que ya funciona para producción.
- **Patrón que enseña:** desmontaje determinista, watch del estado quieto, rangos de escala y reducción, imports
  granulares.
- **Qué NO cubre:** la configuración inicial (ver `arcgis-starter-app`) ni las decisiones de render
  (`arcgis-visualization`).

## Inicio Rápido

```typescript
// Desmontaje de ruta en una SPA que reutiliza el mismo mapa entre rutas.
function leaveRoute(view: MapView, handles: { remove(): void }[]) {
  handles.forEach((h) => h.remove());
  view.map = null;   // conserva el mapa y sus capas para la próxima vista
  view.destroy();    // libera el contexto WebGL
}
```

Medido: crear 20 MapViews y solo vaciar el contenedor dejó vivas las 20; Chromium escribió "Too many active WebGL
contexts. Oldest context will be lost." y 4 vistas terminaron con `fatalError`. Con `destroy()`, ninguna.

## Árbol de Decisión

1. **¿Contextos WebGL perdidos o memoria que crece entre navegaciones?**
   - Sí → `view.destroy()` al desmontar; pon `view.map = null` antes si el mapa se reutiliza.

2. **¿Saltos al desplazar o hacer zoom?**
   - Trabajo en cada cuadro → vigila `view.stationary`, no `view.center` / `view.extent`.
   - Demasiados features → `minScale`/`maxScale`, `featureReduction` (cluster o binning), `definitionExpression`.
   - Prender y apagar capas → `layer.visible`, no quitar y recrear.

3. **¿Bundle inicial demasiado grande?**
   - Importa por módulo (`@arcgis/core/<ruta>.js`, solo los componentes que pintas).
   - `import()` para lo opcional, sabiendo que el SDK ya carga solo, en diferido, la mayor parte de su código.

**Por defecto:** destruir vistas, vigilar el estado quieto, limitar por escala las capas de detalle.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
```

### Imports dinámicos (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Importa solo los componentes que pintas.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: el desmontaje, y lo que destroy() se lleva

`view.destroy()` libera el contexto WebGL de la vista. **También destruye su mapa y todas sus capas** (medido:
`map.destroyed === true`, `layer.destroyed === true`, `map.layers.length === 0`). Si el mapa vive más que la vista
(pestañas, rutas, un store compartido), pon `view.map = null` antes de destruir: medido, el mapa sobrevivió con sus
capas. Quita también tus handles de `watch`/`on`.

### Concepto 2: pintar menos

`minScale`/`maxScale` suspenden una capa fuera de su rango (medido: a escala de país, una capa con `minScale: 50000`
quedó con `suspended: true` y no pidió nada). `featureReduction` agrega puntos densos (un objeto plano
`{ type: "cluster" }` se convierte en `FeatureReductionCluster`). Alternar `layer.visible` conserva la capa: medido, 3
alternancias hicieron **0** pedidos al servicio, y 3 ciclos de quitar y recrear hicieron **24**.

### Concepto 3: expectativas del bundle

No hay módulo raíz: `import * from "@arcgis/core"` y `"@arcgis/core/layers"` no resuelven (TS2307), así que esos
errores de "barrel" rompen el build en vez de inflarlo. El SDK ya se divide solo: un build de Vite con Map + MapView +
FeatureLayer produjo **748 chunks** con un chunk inicial de 1494 KB (430 KB gzip). Pasar `CSVLayer` y `KMLLayer` a
`import()` solo ahorró **24 KB (6 KB gzip)** de código inicial (`tests/bundle/medir.mjs`). Usa `import()` para lo
opcional, pero no esperes que arregle una primera carga lenta.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Dejar vistas vivas

```typescript
// ❌ Anti-patrón
function leaveRoute() { container.innerHTML = ""; } // la vista y su contexto WebGL siguen vivos
```

```typescript
// ✅ Correcto
function leaveRoute() { view.destroy(); }
```

**Impacto:** medido con 20 vistas: todas siguieron vivas, Chromium soltó los contextos WebGL más viejos ("Too many
active WebGL contexts") y 4 vistas llegaron a `fatalError`. Con `destroy()`: 0.

### Pitfall 2: destroy() en una vista cuyo mapa todavía necesitas

```typescript
// ❌ Anti-patrón
view.destroy();
newView.map = sharedMap; // sharedMap se destruyó con la vista vieja, capas incluidas
```

```typescript
// ✅ Correcto
view.map = null;
view.destroy();
newView.map = sharedMap;
```

**Impacto:** medido: después de `view.destroy()`, `map.destroyed` y `layer.destroyed` eran `true` y el mapa tenía 0
capas; la vista siguiente muestra un mapa vacío.

### Pitfall 3: Recalcular en cada cuadro de un desplazamiento

```typescript
// ❌ Anti-patrón
reactiveUtils.watch(() => view.center, () => expensiveRecompute());
```

```typescript
// ✅ Correcto
reactiveUtils.watch(() => view.stationary, (stationary) => { if (stationary) expensiveRecompute(); });
```

**Impacto:** medido durante un `goTo` de 1,5 s: el watch de `center` se disparó **92** veces, el de `stationary`
**una**.

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

- [Optimize performance](https://developers.arcgis.com/javascript/latest/programming-patterns/)
- [Clustering](https://developers.arcgis.com/javascript/latest/sample-code/featurereduction-cluster/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido en `tests/runtime/casos/arcgis-performance.ts` y `tests/bundle/medir.mjs`.
  El viejo pitfall 1 (`import * from "@arcgis/core"`) y su gemelo de barrel no resuelven, así que no pueden "inflar el
  bundle"; el `import()` del inicio rápido ahorró 24 KB de un chunk inicial de 1494 KB porque el SDK ya se divide en
  unos 748 chunks. Nuevos pitfalls principales, con números: vistas que quedan vivas (4 de 20 perdieron el contexto
  WebGL), `view.destroy()` que destruye un mapa compartido con sus capas, y `watch(center)` (92 disparos contra 1).
- **0.1.0** (2026-05-31): Versión inicial.
