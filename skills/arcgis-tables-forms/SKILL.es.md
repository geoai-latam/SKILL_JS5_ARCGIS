---
name: arcgis-tables-forms
description: >
  Muestra y edita datos tabulares de atributos con el ArcGIS Maps SDK for
  JavaScript 5.0: el componente arcgis-feature-table para vistas tipo hoja de
  cálculo, el componente arcgis-feature-form para edición de atributos, y la
  consulta de registros relacionados. Usa esta skill cuando el usuario muestre una
  tabla de features, construya un formulario de atributos, o use registros relacionados.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
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
- **Patrón que enseña:** enlazar un componente a una capa; manejar formularios desde FormTemplate; recorrer relaciones.
- **Qué NO cubre:** flujos de edición completos (ver `arcgis-editing`) ni popups (ver `arcgis-popup-templates`).

## Inicio Rápido

```typescript
import "@arcgis/map-components/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });
// <arcgis-feature-table reference-element="arcgis-map"></arcgis-feature-table>
(document.querySelector("arcgis-feature-table") as any).layer = layer;
```

## Árbol de Decisión

1. **¿Vista tipo hoja de cálculo con muchas filas?**
   - Sí → `arcgis-feature-table`.

2. **¿Editar los atributos de una feature?**
   - Sí → `arcgis-feature-form` manejado por un `FormTemplate`.

3. **¿Necesitas registros de una tabla relacionada?**
   - Sí → `layer.queryRelatedFeatures(RelationshipQuery)`.

**Default:** componentes primero; los widgets deprecados `FeatureTable`/`FeatureForm` solo como fallback.

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
import "@arcgis/map-components/components/arcgis-feature-form";
```

## Conceptos Clave

### Concepto 1: Enlazar una tabla a una capa

Define la propiedad `layer` del componente a un `FeatureLayer`. Usa `reference-element` para asociar
la tabla con un mapa y mantener la selección y el mapa en sincronía.

### Concepto 2: FormTemplate

`arcgis-feature-form` renderiza campos desde un `FormTemplate` (elementos de campo, grupos,
expresiones). Sin plantilla, usa los campos de la capa por defecto.

### Concepto 3: Registros relacionados

Las relaciones se consultan vía `RelationshipQuery` y `layer.queryRelatedFeatures`. Los resultados
se indexan por el objectId de la feature padre.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Definir la capa antes de agregarla/cargarla

```typescript
// ❌ Anti-patrón
table.layer = new FeatureLayer({ url }); // la tabla renderiza antes de cargar campos
```

```typescript
// ✅ Correcto
const layer = new FeatureLayer({ url });
await layer.load();
table.layer = layer;
```

**Impacto:** la tabla renderiza con columnas faltantes hasta que cargan los campos.

### Pitfall 2: Usar el widget deprecado en una app nueva

```typescript
// ❌ Anti-patrón
import FeatureTable from "@arcgis/core/widgets/FeatureTable.js"; // deprecado en 5.0
```

```typescript
// ✅ Correcto
import "@arcgis/map-components/components/arcgis-feature-table";
```

**Impacto:** construir sobre un widget destinado a removerse en 6.0.

### Pitfall 3: relationshipId incorrecto para registros relacionados

```typescript
// ❌ Anti-patrón
new RelationshipQuery({ objectIds: [id], relationshipId: 0 }); // id adivinado
```

```typescript
// ✅ Correcto
await layer.load();
const rel = layer.relationships[0]; // inspecciona las relaciones reales
new RelationshipQuery({ objectIds: [id], relationshipId: rel.id });
```

**Impacto:** la query no retorna nada porque el id de relación está mal.

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

- [FeatureTable component](https://developers.arcgis.com/javascript/latest/api-reference/)
- [FeatureForm component](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
