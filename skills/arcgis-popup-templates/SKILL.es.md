---
name: arcgis-popup-templates
description: >
  Configura popups con PopupTemplate en el ArcGIS Maps SDK for JavaScript 5.1:
  título y contenido con placeholders de campos, fieldInfos con formato
  (separadores de miles, fechas y la zona horaria de la vista), contenido de media
  y gráficos, y funciones de contenido (que necesitan template.outFields). Usa
  esta skill cuando el usuario personalice lo que aparece al hacer clic en un
  feature, formatee campos del popup o construya contenido propio.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: interaction
tags:
  - popup
  - popuptemplate
  - fieldinfos
  - content
  - formatting
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Plantillas de Popup

> **Cuándo usar:** Activa esta skill cuando el usuario personalice el título/contenido del popup,
> formatee campos, o construya HTML custom que se muestra al clicar una feature.

## Resumen

Un `PopupTemplate` declara qué muestra el popup de una capa: un título, bloques de contenido y el formato de los
campos.

- **Problema que resuelve:** convertir atributos crudos en un popup legible y bien formateado.
- **A quién sirve:** desarrolladores que muestran el detalle de un feature al hacer clic.
- **Patrón que enseña:** placeholders + bloques de contenido; funciones solo para diseños propios.
- **Qué NO cubre:** la mecánica del clic (ver `arcgis-interaction`) ni la edición (ver `arcgis-editing`).

## Inicio Rápido

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  content: [{
    type: "fields",
    fieldInfos: [
      { fieldName: "POP", label: "Población", format: { digitSeparator: true, places: 0 } },
      { fieldName: "CREATED", label: "Creado", format: { dateFormat: "short-date" } },
    ],
  }],
});
view.timeZone = "UTC"; // si tus fechas se guardan como medianoche UTC (ver Pitfall 2)
```

Medido con 5.1.27: sin `digitSeparator`, 7900000 se ve como `7900000`; con él, `7.900.000` en locale `es`.

## Árbol de Decisión

1. **¿Solo campos y un título?**
   - Sí → `title` como string + un bloque `fields`. Los placeholders traen sus propios campos.

2. **¿Formato (separadores, fechas, decimales)?**
   - Sí → `fieldInfos[].format`; para fechas decide también la zona horaria (`view.timeZone`).

3. **¿HTML a la medida?**
   - Sí → una función de `content` que devuelva un elemento, **más** `outFields` en el template con cada campo que
     lea.

**Por defecto:** contenido `fields` declarativo; usa una función solo para HTML propio.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
```

### Imports dinámicos (CDN)

```javascript
const PopupTemplate = await $arcgis.import("@arcgis/core/PopupTemplate.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Pon layer.popupTemplate; el componente arcgis-map lo pinta en arcgis-popup.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: los placeholders traen sus propios campos

`title` y el contenido de texto aceptan placeholders `{CAMPO}`. Medido: **no distinguen mayúsculas** (`{Name}` y
`{name}` mostraron `Bogotá` para un campo `NAME`), un campo que no existe sale vacío, y en una capa de servicio con
`outFields: ["areaname"]` un placeholder `{pop2000}` igual mostró `8008278`: el popup pidió el campo al abrirse,
aunque el graphic del hit test solo traía `areaname` y `objectid`.

### Concepto 2: bloques de contenido

`content` puede ser un array de bloques: `fields` (tabla), `media` (gráficos/imágenes), `text` (HTML con
placeholders), `attachments`, `expression` (Arcade) y `relationship`. Se pintan de arriba abajo.

### Concepto 3: funciones de contenido

`content` puede ser una función `({ graphic }) => HTMLElement | string | Promise<...>` (medido: el argumento solo
traía `graphic`; una función async se pintó bien). El SDK no puede ver qué campos lee una función, así que no los
pide: ponlos en los `outFields` del template. Los strings que devuelven las funciones y el contenido de texto se
sanitizan: medido, `<img onerror>` y `<script>` se eliminaron y no corrió nada, mientras que etiquetas inofensivas
como `<b>` se conservaron, incluso cuando venían del valor de un atributo.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Una función de contenido que lee un campo que nadie pidió

```typescript
// ❌ Anti-patrón
new FeatureLayer({ url, outFields: ["areaname"], popupTemplate: new PopupTemplate({
  content: (f: { graphic: Graphic }) => `Población: ${f.graphic.attributes.pop2000}`,
}) });
```

```typescript
// ✅ Correcto
new PopupTemplate({
  outFields: ["pop2000"],
  content: (f: { graphic: Graphic }) => `Población: ${f.graphic.attributes.pop2000}`,
});
```

**Impacto:** medido en un servicio público: `Población: undefined`; con `outFields: ["pop2000"]` en el template,
`8008278`. Los placeholders declarativos no tienen este problema.

### Pitfall 2: Fechas que salen con el día anterior

```typescript
// ❌ Anti-patrón
{ fieldName: "CREATED", format: { dateFormat: "short-date" } } // guardada como 2026-10-27T00:00Z
```

```typescript
// ✅ Correcto
view.timeZone = "UTC"; // o la zona en la que se capturó el dato
```

**Impacto:** medido en `America/Bogota`: el `view.timeZone` por defecto es `"system"`, así que una medianoche UTC del
27/10/2026 salió como `26/10/2026, 7:00 p. m.` (y `26/10/2026` con `short-date`). Con `view.timeZone = "UTC"`:
`27/10/2026`.

### Pitfall 3: Esperar separadores de miles por defecto

```typescript
// ❌ Anti-patrón
{ fieldName: "POP", label: "Población" } // muestra 7900000
```

```typescript
// ✅ Correcto
const popInfo = { fieldName: "POP", label: "Población", format: { digitSeparator: true, places: 0 } };
```

**Impacto:** medido: `7900000` sin formato, `7.900.000` con `digitSeparator: true` (locale `es`).

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de PopupTemplate / content | `references/api-detail.md` |
| Ejemplos de fields / media / custom | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-interaction` — el clic que abre el popup
- `arcgis-layers` — define los `outFields` que el popup necesita
- `arcgis-arcade` — expresiones para contenido del popup

## Samples de Referencia

- [PopupTemplate](https://developers.arcgis.com/javascript/latest/sample-code/popuptemplate-function/)
- [Popup with media](https://developers.arcgis.com/javascript/latest/sample-code/popup-multipleelements/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido abriendo popups reales en
  `tests/runtime/casos/arcgis-popup-templates.ts`. Los tres pitfalls principales de antes eran falsos o exagerados:
  los placeholders no distinguen mayúsculas; el popup pide los campos de sus placeholders aunque los `outFields` de la
  capa no los tengan; y el HTML en string se sanitiza (no corrió ningún script). Nuevos pitfalls principales, medidos:
  las funciones de contenido sí necesitan `template.outFields` (`undefined` sin él), las fechas UTC salen con el día
  anterior con el `view.timeZone` por defecto `"system"`, y los números no traen separadores por defecto. Se
  arreglaron dos pitfalls extendidos que no compilaban.
- **0.1.0** (2026-05-31): Versión inicial.
