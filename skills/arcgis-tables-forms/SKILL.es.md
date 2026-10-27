---
name: arcgis-tables-forms
description: >
  Muestra y edita datos tabulares de atributos con el ArcGIS Maps SDK for
  JavaScript 5.1: el componente arcgis-feature-table (enlazado al mapa solo con
  reference-element, filtrado con su propio definitionExpression), el componente
  arcgis-feature-form (submit() valida pero nunca guarda) y los registros
  relacionados con queryRelatedFeatures (los padres sin relacionados no aparecen
  en el resultado). Usa esta skill cuando el usuario muestre una tabla de
  features, construya un formulario de atributos o use registros relacionados.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: layers
tags:
  - featuretable
  - featureform
  - related-records
  - attributes
  - editing
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Tablas y Formularios

> **Cuándo usar:** Activa esta skill cuando el usuario muestre una tabla de features, construya un
> formulario de atributos, o consulte registros relacionados.

## Resumen

Estos componentes presentan los atributos de una capa como tabla o formulario editable, con soporte de relacionados.

- **Problema que resuelve:** UIs centradas en atributos sobre datos espaciales.
- **A quién sirve:** desarrolladores que construyen apps de inspección, activos y captura de datos.
- **Patrón que enseña:** enlazar un componente a una capa y al mapa; guardar tú los valores del formulario; leer las
  relaciones de la capa.
- **Qué NO cubre:** flujos de edición completos (ver `arcgis-editing`) ni popups (ver `arcgis-popup-templates`).

## Inicio Rápido

```html
<arcgis-map id="map" basemap="osm" center="-117.15,32.72" zoom="11"></arcgis-map>
<arcgis-feature-table reference-element="#map"></arcgis-feature-table>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0" });
const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
mapEl.map?.add(layer);
document.querySelector("arcgis-feature-table")!.layer = layer; // la tabla carga la capa por su cuenta
```

No hace falta `await layer.load()` antes: medido en 5.1.27, una tabla que recibe una capa sin cargar la carga y
muestra las 12 columnas y las 420 filas. También sirve una tabla con solo la URL:
`<arcgis-feature-table layer-url="...">`.

## Árbol de Decisión

1. **¿Vista tipo hoja de cálculo con muchas filas?**
   - Sí → `arcgis-feature-table`. Pagina sola (`pageSize` 50); fíltrala con su propio `definitionExpression`.

2. **¿Editar los atributos de una feature?**
   - Sí → `arcgis-feature-form` con `layer`, `feature` y, si quieres, un `FormTemplate`; guarda en `arcgisSubmit`.

3. **¿Necesitas registros de una tabla relacionada?**
   - Sí → `layer.queryRelatedFeatures(RelationshipQuery)` con un id leído de `layer.relationships`.

**Por defecto:** componentes. Los widgets `FeatureTable` y `FeatureForm` están deprecados desde 5.0.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

### Imports dinámicos (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-feature-form";
```

## Conceptos Clave

### Concepto 1: La tabla y el mapa solo se enlazan con reference-element

Sin `reference-element`, el `view` de la tabla es `null` (medido): seleccionar una fila no resalta nada en el mapa y
`filterByViewExtent` no tiene extensión que usar. Apúntala al mapa con un selector, como `reference-element="#map"`.

### Concepto 2: El formulario valida; tú guardas

`submit()` dispara `arcgisSubmit` con `{ valid, invalid, values }` (medido): las listas de campos que pasan y que
fallan, y los valores actuales. Nada llega al servicio hasta que llamas `layer.applyEdits`.

### Concepto 3: Los relacionados vuelven por padre

`queryRelatedFeatures` resuelve a un objeto con el objectId del padre como clave, y solo están los padres que tienen
relacionados. Medido sobre las solicitudes de servicio de San Diego: de 200 pedidas, volvieron 4.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Esperar que la tabla siga al mapa sin reference-element

```html
<!-- ❌ Anti-patrón: la tabla no tiene vista -->
<arcgis-feature-table></arcgis-feature-table>
```

```html
<!-- ✅ Correcto -->
<arcgis-feature-table reference-element="#map"></arcgis-feature-table>
```

**Impacto:** medido: `table.view` es `null`. Hacer clic en una fila no resalta nada, y no hay error.

### Pitfall 2: Leer todos los padres del resultado de relacionados

```typescript
// ❌ Anti-patrón: un id adivinado, y padres que se asumen presentes
const res = await layer.queryRelatedFeatures(new RelationshipQuery({ objectIds: ids, relationshipId: 1 }));
const firstCount = res[ids[0]].features.length; // TypeError si ese padre no tiene relacionados
```

```typescript
// ✅ Correcto
await layer.load();
const rel = layer.relationships?.[0];
if (rel) {
  const res = await layer.queryRelatedFeatures(
    new RelationshipQuery({ objectIds: ids, relationshipId: rel.id, outFields: ["*"] }),
  );
  const related = ids.map((id) => res[id]?.features ?? []);
}
```

**Impacto:** medido: un `relationshipId` equivocado rechaza con el opaco "Unable to complete operation.", y con el
correcto solo 4 de 200 padres fueron claves del resultado.

### Pitfall 3: Activar la edición en una capa que no se puede editar

```typescript
// ❌ Anti-patrón
table.editingEnabled = true; // sobre un servicio de solo lectura
```

```typescript
// ✅ Correcto
await layer.load();
table.editingEnabled = layer.editingEnabled && !!layer.capabilities?.operations?.supportsUpdate;
```

**Impacto:** medido sobre una capa de MapServer (`supportsUpdate: false`): la tabla aceptó `editingEnabled = true` y
marcó 6 de 6 columnas como editables, sin aviso. El usuario escribe y el guardado falla después.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de componentes + RelationshipQuery | `references/api-detail.md` |
| Ejemplos de tabla / form / relacionados | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — el FeatureLayer detrás de la tabla
- `arcgis-editing` — flujos de edición completos con applyEdits
- `arcgis-popup-templates` — visualización de atributos en popups

## Samples de Referencia

- [Feature Table component](https://developers.arcgis.com/javascript/latest/references/map-components/arcgis-feature-table/)
- [Feature Form component](https://developers.arcgis.com/javascript/latest/references/map-components/arcgis-feature-form/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Pruebas en tiempo de ejecución en `tests/runtime/casos/arcgis-tables-forms.ts`.
  Se quitó el pitfall de «cargar la capa antes de enlazarla»: medido, la tabla la carga sola (12 columnas, 420
  filas). Nuevos pitfalls principales, todos medidos: sin `reference-element` el `table.view` queda en null; un
  `relationshipId` equivocado da un error opaco y los padres sin relacionados no están en el resultado;
  `editingEnabled` sobre una capa de solo lectura se acepta en silencio. Se documentó `arcgisSubmit` (`valid`,
  `invalid`, `values`), el `definitionExpression` propio de la tabla y `layer-url`. Los snippets y ejemplos usan un
  servicio público; el ejemplo del formulario ahora pone `layer` y `feature`, y se arregló el pitfall extendido que
  no compilaba (TS1108).
- **0.1.0** (2026-05-31): Versión inicial.
