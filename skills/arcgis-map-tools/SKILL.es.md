---
name: arcgis-map-tools
description: >
  Agrega herramientas interactivas de mapa con los Map Components del ArcGIS Maps
  SDK for JavaScript 5.0: arcgis-sketch para dibujar/editar geometría,
  arcgis-measurement (y variantes de área/distancia) para medir, y
  arcgis-snapping-controls para snapping. Usa esta skill cuando el usuario agregue
  herramientas de dibujo, medición o snapping a un mapa o escena.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - sketch
  - measurement
  - snapping
  - tools
  - components
requires:
  - arcgis-interaction
packages:
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Herramientas de Mapa

> **Cuándo usar:** Activa esta skill cuando el usuario agregue herramientas de dibujo, medición o
> snapping a un mapa o escena.

## Resumen

Estos componentes dan sketching, medición y snapping listos para el usuario sin código custom.

- **Problema que resuelve:** UX estándar de edición/medición lista para usar.
- **A quién sirve:** desarrolladores que agregan herramientas interactivas a una app de mapa.
- **Patrón que enseña:** coloca el componente, enlázalo al mapa, lee sus eventos.
- **Qué NO cubre:** dibujo programático (ver `arcgis-interaction`) ni persistencia (`arcgis-editing`).

## Inicio Rápido

```typescript
import "@arcgis/map-components/components/arcgis-sketch";
// <arcgis-map><arcgis-sketch position="top-right"></arcgis-sketch></arcgis-map>
```

## Árbol de Decisión

1. **¿Dibujar/editar geometría interactivamente?**
   - Sí → `arcgis-sketch`.

2. **¿Medir distancia/área?**
   - Sí → `arcgis-measurement` (o las variantes 2d/3d de distancia/área).

3. **¿Snap a features existentes al dibujar?**
   - Sí → `arcgis-snapping-controls` junto al sketch.

**Default:** `arcgis-sketch` para dibujar, `arcgis-measurement` para medir.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/components/arcgis-measurement";
```

### Imports Dinámicos (CDN)

```javascript
const SketchVM = await $arcgis.import("@arcgis/core/widgets/Sketch/SketchViewModel.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-snapping-controls";
```

## Conceptos Clave

### Concepto 1: Componente Sketch

`arcgis-sketch` provee una barra para dibujar puntos/líneas/polígonos y editarlos. Maneja su propia
capa de gráficos; escucha eventos create/update/delete.

### Concepto 2: Componentes de medición

`arcgis-measurement` alterna entre distancia y área; existen variantes `*-2d`/`*-3d` para
comportamiento por tipo de view. Los resultados se actualizan en vivo al medir.

### Concepto 3: Snapping

`arcgis-snapping-controls` alterna snapping a feature/self/grid y se cablea al sketch activo,
mejorando la precisión al dibujar cerca de geometría existente.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Componente de medición desalineado con la view

```typescript
// ❌ Anti-patrón
// <arcgis-direct-line-measurement-3d> en un mapa 2D
```

```typescript
// ✅ Correcto
// Usa variantes *-2d en MapView, *-3d en SceneView.
```

**Impacto:** la herramienta no hace nada en el tipo de view equivocado.

### Pitfall 2: Esperar que los gráficos del sketch persistan

```typescript
// ❌ Anti-patrón
// Dibujar con arcgis-sketch asumiendo que guarda al servicio
```

```typescript
// ✅ Correcto
// Lee la geometría dibujada y persiste vía applyEdits (ver arcgis-editing).
```

**Impacto:** los dibujos desaparecen al recargar; el sketch es del lado cliente.

### Pitfall 3: Snapping sin nada a qué hacer snap

```typescript
// ❌ Anti-patrón
// Habilitar snapping de features sin fuentes de snapping configuradas
```

```typescript
// ✅ Correcto
// Configura fuentes de snapping (capas) para que el snapping tenga objetivos.
```

**Impacto:** el snapping parece apagado porque no hay fuentes.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos/eventos de los componentes de herramienta | `references/api-detail.md` |
| Ejemplos de sketch / medir / snap | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-interaction` — SketchViewModel programático
- `arcgis-editing` — persiste la geometría dibujada
- `arcgis-core-maps` — el mapa/escena a enlazar

## Samples de Referencia

- [Sketch component](https://developers.arcgis.com/javascript/latest/sample-code/sketch-geometries/)
- [Measurement](https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
