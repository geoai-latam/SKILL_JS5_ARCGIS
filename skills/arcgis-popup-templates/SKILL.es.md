---
name: arcgis-popup-templates
description: >
  Configura popups con PopupTemplate en el ArcGIS Maps SDK for JavaScript 5.0:
  templating de título y contenido con placeholders de campo, fieldInfos con
  formato, contenido de media y charts, y HTML custom vía una función de content.
  Usa esta skill cuando el usuario personalice lo que aparece al clicar una
  feature, formatee campos del popup, o construya contenido de popup custom.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Plantillas de Popup

> **Cuándo usar:** Activa esta skill cuando el usuario personalice el título/contenido del popup,
> formatee campos, o construya HTML custom que se muestra al clicar una feature.

## Resumen

Un `PopupTemplate` declara qué muestra el popup de una capa: un título, bloques de contenido y formato de campos.

- **Problema que resuelve:** convertir atributos crudos en un popup legible y formateado.
- **A quién sirve:** desarrolladores que presentan detalles de feature al hacer clic.
- **Patrón que enseña:** templating con placeholders + bloques de contenido (fields/media/text/custom).
- **Qué NO cubre:** el plumbing del clic (ver `arcgis-interaction`) ni la edición (ver `arcgis-editing`).

## Inicio Rápido

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  content: [{ type: "fields", fieldInfos: [{ fieldName: "POP", label: "Población" }] }],
});
```

## Árbol de Decisión

1. **¿Solo campos y un título?**
   - Sí → `title` string + un bloque de contenido `fields`.

2. **¿Necesitas formato (separadores, fechas, moneda)?**
   - Sí → define `fieldInfos[].format`.

3. **¿Necesitas HTML/widgets a medida?**
   - Sí → una función `content` que retorne un HTMLElement.

**Default:** contenido `fields` declarativo; usa una función solo para HTML custom.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
```

### Imports Dinámicos (CDN)

```javascript
const PopupTemplate = await $arcgis.import("@arcgis/core/PopupTemplate.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Define layer.popupTemplate; el componente arcgis-map renderiza el popup.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Placeholders

`title` y el contenido de texto soportan placeholders `{FIELD}` resueltos por feature. Combina
campos y texto estático, ej. `"{NAME} — {POP} habitantes"`.

### Concepto 2: Bloques de contenido

`content` puede ser un array de bloques: `fields` (tabla), `media` (charts/imágenes), `text` (HTML)
y `attachments`. Se renderizan de arriba a abajo.

### Concepto 3: Función de content custom

`content` puede ser una función `(feature) => HTMLElement | string`. Úsala para layouts a medida;
recibe el gráfico de la feature clicada.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Typos en placeholders de campo

```typescript
// ❌ Anti-patrón
new PopupTemplate({ title: "{Name}" }); // el campo es NAME
```

```typescript
// ✅ Correcto
new PopupTemplate({ title: "{NAME}" });
```

**Impacto:** el popup muestra el texto literal `{Name}` en vez del valor.

### Pitfall 2: Olvidar los outFields que el popup necesita

```typescript
// ❌ Anti-patrón
new FeatureLayer({ url, outFields: ["NAME"], popupTemplate }); // el popup también usa POP
```

```typescript
// ✅ Correcto
new FeatureLayer({ url, outFields: ["NAME", "POP"], popupTemplate });
```

**Impacto:** los campos del popup salen en blanco porque el dato nunca se trajo.

### Pitfall 3: Retornar un string de HTML sin sanitizar

```typescript
// ❌ Anti-patrón
content: (f) => `<div>${f.graphic.attributes.NOTES}</div>`; // riesgo de inyección
```

```typescript
// ✅ Correcto
content: (f) => { const d = document.createElement("div"); d.textContent = f.graphic.attributes.NOTES; return d; };
```

**Impacto:** valores de atributo no confiables pueden inyectar markup/script.

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

- **0.1.0** (2026-05-31): Versión inicial.
