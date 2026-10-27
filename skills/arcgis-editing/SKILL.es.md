---
name: arcgis-editing
description: >
  Edita datos de features con el ArcGIS Maps SDK for JavaScript 5.1: el componente
  arcgis-editor para una UI de edición completa, FeatureLayer.applyEdits para
  add/update/delete programático, y manejo de attachments. Usa esta skill cuando
  el usuario cree, actualice o borre features, construya una experiencia de
  edición, o gestione attachments de features.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
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

`layer.applyEdits({ addFeatures, updateFeatures, deleteFeatures })` resuelve a arrays de resultado;
cada elemento tiene `objectId` y `error`. Medido con 5.1.27 sobre una capa en cliente:

- Una edición mala **no rechaza la promesa**: vuelve como `error` en su resultado ("Identifier
  fields: OBJECTID missing", "Feature with object id 9999 missing").
- **No es transaccional**: en un lote con un update válido y uno inválido, el válido se aplica. Para
  un servicio, `applyEdits(edits, { rollbackOnFailureEnabled: true })` pide todo o nada (no medido
  aquí).
- **Éxitos silenciosos:** borrar un `objectId` que no existe devuelve `ok`; un atributo cuyo nombre
  no es un campo (`ESTADO`) se descarta y el update igual devuelve `ok`. Los nombres de campo se
  comparan sin distinguir mayúsculas (`status` actualizó `STATUS`).
- La llamada entera **rechaza** solo por problemas de la capa: `editingEnabled: false` ("Editing is
  disabled for layer") o valores z en una capa sin z.
- Una geometría en otra referencia espacial se proyecta sola (un punto en 3857 quedó guardado en
  4326 en `-74.0806, 4.6000`), y el layer view se actualiza sin `refresh()` (2 → 3 features; un
  evento `edits`).

### Concepto 2: El componente editor

`arcgis-editor` reemplaza al widget `Editor` (deprecado desde 5.0). Se enlaza con
`reference-element`; sin `layerInfos` edita todas las capas editables del mapa (medido:
`state === "ready"`). También tiene `startUpdateFeaturesWorkflow`, flujos de merge y split, y en 5.1
los controles de la cuadrícula de snapping (`hide-snapping-controls-elements-grid-*`).

### Concepto 3: Attachments

Cuando `layer.capabilities.data.supportsAttachment` es true, usa `addAttachment(feature, form)` (un
`FormData` o un `<form>`) y `queryAttachments({ objectIds })`, que resuelve a
`{ [objectId]: AttachmentInfo[] }`.

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

**Impacto:** medido: un update con un id que no existe resuelve normal; solo su resultado trae el
error. Un `try/catch` alrededor de `applyEdits` no lo ve.

### Pitfall 2: Editar una capa no editable

```typescript
// ❌ Anti-patrón
await layer.applyEdits({ addFeatures }); // el servicio no tiene capacidad de create
```

```typescript
// ✅ Correcto
await layer.load();
if (layer.editingEnabled && layer.capabilities?.operations?.supportsAdd) await layer.applyEdits({ addFeatures });
```

**Impacto:** medido sobre una capa de MapServer: `supportsAdd`, `supportsUpdate`, `supportsEditing`
y `editingEnabled` dan `false`. Con `editingEnabled: false` la llamada rechaza con "Editing is
disabled for layer".

### Pitfall 3: Actualizar sin el objectId

```typescript
// ❌ Anti-patrón
const g = new Graphic({ attributes: { STATUS: "done" } }); // sin OBJECTID
await layer.applyEdits({ updateFeatures: [g] });
```

```typescript
// ✅ Correcto
const g = new Graphic({ attributes: { [layer.objectIdField]: 42, STATUS: "done" } });
await layer.applyEdits({ updateFeatures: [g] });
```

**Impacto:** medido: no hay excepción; el resultado dice "Identifier fields: OBJECTID missing" y no
cambia ninguna fila. Usa `layer.objectIdField`: no siempre se llama `OBJECTID` (`FID`, `objectid`).

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

- **0.2.0** (2026-10-27): SDK 5.1. El código corría; dos pitfalls extendidos eran falsos: una geometría en otra
  referencia espacial se proyecta sola (no queda mal ubicada ni se rechaza) y el layer view se actualiza sin
  `refresh()`. Se cambiaron por lo que sí falla en silencio: borrar un id que no existe devuelve `ok`, los campos
  desconocidos se descartan con `ok`. Medido que una edición mala nunca rechaza la promesa, que los lotes no son
  transaccionales y qué errores sí rechazan. `objectIdField` en vez de `OBJECTID` fijo. En
  `tests/runtime/casos/arcgis-editing.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
