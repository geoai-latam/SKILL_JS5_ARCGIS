---
name: arcgis-editing
description: >
  Edita datos de features con el ArcGIS Maps SDK for JavaScript 5.0: el componente
  arcgis-editor para una UI de edición completa, FeatureLayer.applyEdits para
  add/update/delete programático, y manejo de attachments. Usa esta skill cuando
  el usuario cree, actualice o borre features, construya una experiencia de
  edición, o gestione attachments de features.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: interaction
tags:
  - editing
  - applyedits
  - editor
  - attachments
  - crud
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Edición

> **Cuándo usar:** Activa esta skill cuando el usuario cree/actualice/borre features, construya una
> UI de edición, o gestione attachments.

## Resumen

La edición persiste cambios de features a un servicio. Usa el componente editor para UI, o applyEdits en código.

- **Problema que resuelve:** create/update/delete (CRUD) en servicios de features editables.
- **A quién sirve:** desarrolladores que construyen apps de captura y mantenimiento de datos.
- **Patrón que enseña:** `arcgis-editor` para UI lista; `applyEdits` para control programático.
- **Qué NO cubre:** dibujar geometría (ver `arcgis-interaction`) ni formularios (ver `arcgis-tables-forms`).

## Inicio Rápido

```typescript
const result = await layer.applyEdits({ addFeatures: [graphic] });
console.log(result.addFeatureResults[0].objectId);
```

## Árbol de Decisión

1. **¿Quieres una UI de edición lista?**
   - Sí → componente `arcgis-editor`.

2. **¿Necesitas control programático / UI custom?**
   - Sí → `layer.applyEdits({ addFeatures, updateFeatures, deleteFeatures })`.

3. **¿Editar archivos/fotos en features?**
   - Sí → `layer.addAttachment` / `queryAttachments`.

**Default:** `arcgis-editor` para flujos estándar; `applyEdits` para lógica custom.

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
import "@arcgis/map-components/components/arcgis-editor";
```

## Conceptos Clave

### Concepto 1: applyEdits

`layer.applyEdits({ addFeatures, updateFeatures, deleteFeatures })` resuelve a arrays de resultado.
Cada resultado tiene `objectId` y `error` — siempre revisa fallos parciales.

### Concepto 2: El componente editor

`arcgis-editor` (que reemplaza al widget `Editor` deprecado) provee flujos de create/update,
snapping, e integración de formularios con `reference-element` enlazado al mapa.

### Concepto 3: Attachments

Cuando `capabilities.data.supportsAttachment` de la capa es true, usa `addAttachment(feature, form)`
y `queryAttachments` para gestionar fotos/archivos por feature.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Ignorar errores por edición

```typescript
// ❌ Anti-patrón
await layer.applyEdits({ updateFeatures }); // asumir éxito
```

```typescript
// ✅ Correcto
const r = await layer.applyEdits({ updateFeatures });
r.updateFeatureResults.forEach((res) => { if (res.error) console.error(res.error); });
```

**Impacto:** fallos parciales silenciosos dejan los datos inconsistentes.

### Pitfall 2: Editar una capa no editable

```typescript
// ❌ Anti-patrón
await layer.applyEdits({ addFeatures }); // el servicio no tiene capacidad de create
```

```typescript
// ✅ Correcto
await layer.load();
if (layer.capabilities?.operations?.supportsAdd) await layer.applyEdits({ addFeatures });
```

**Impacto:** el servicio rechaza las ediciones.

### Pitfall 3: Actualizar sin el objectId

```typescript
// ❌ Anti-patrón
const g = new Graphic({ attributes: { STATUS: "done" } }); // sin OBJECTID
await layer.applyEdits({ updateFeatures: [g] });
```

```typescript
// ✅ Correcto
const g = new Graphic({ attributes: { OBJECTID: 42, STATUS: "done" } });
await layer.applyEdits({ updateFeatures: [g] });
```

**Impacto:** el servicio no puede emparejar la fila a actualizar.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| applyEdits / editor / attachments | `references/api-detail.md` |
| Ejemplos de CRUD + attachments | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-tables-forms` — formularios de atributos para edición
- `arcgis-interaction` — dibuja geometrías a editar
- `arcgis-layers` — el FeatureLayer editable

## Samples de Referencia

- [applyEdits](https://developers.arcgis.com/javascript/latest/sample-code/editing-applyedits/)
- [Editor component](https://developers.arcgis.com/javascript/latest/sample-code/editor-basic/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
