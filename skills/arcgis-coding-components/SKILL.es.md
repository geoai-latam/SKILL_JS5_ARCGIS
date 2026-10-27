---
name: arcgis-coding-components
description: >
  Embebe un editor de expresiones Arcade con los coding components del ArcGIS
  Maps SDK for JavaScript 5.1: arcgis-arcade-editor con perfil (validación y
  autocompletado contra los campos reales), eventos de diagnósticos, datos de
  prueba, el depurador de 5.1 y el interruptor del asistente de Arcade. Usa esta
  skill cuando el usuario construya un editor in-app de expresiones Arcade.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: new-in-5.0
tags:
  - coding
  - arcade-editor
  - code-editor
  - syntax-highlighting
  - components
requires:
  - arcgis-arcade
packages:
  - "@arcgis/coding-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Coding Components

> **Cuándo usar:** Activa esta skill cuando el usuario construya un editor in-app de expresiones
> Arcade (popups, etiquetas, renderers, cálculo de campos) con validación y autocompletado.

## Resumen

`arcgis-arcade-editor` es un editor de Arcade completo: resaltado de sintaxis, autocompletado a
partir de un perfil, diagnósticos, ejecución de prueba con datos de ejemplo, depurador (5.1) y un
asistente de IA (beta).

- **Problema que resuelve:** que los usuarios escriban Arcade en tu app sin romper el mapa.
- **A quién sirve:** desarrolladores de constructores de expresiones, herramientas de
  administración y configuradores.
- **Patrón que enseña:** `profile` del editor = perfil de ejecución; leer
  `arcgisDiagnosticsChange` antes de aplicar `arcgisScriptChange`.
- **Qué NO cubre:** ejecutar Arcade (ver `arcgis-arcade`) ni cláusulas SQL `where`: los editores
  SQL de este paquete son internos (ver Concepto 4).

## Inicio Rápido

```typescript
import "@arcgis/coding-components/components/arcgis-arcade-editor";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type Graphic from "@arcgis/core/Graphic.js";

declare const layer: FeatureLayer; // loaded, so the editor knows its fields
declare const sample: Graphic;     // one feature to run the script against

const editor = document.querySelector("arcgis-arcade-editor")!;
editor.profile = { id: "popup", definitions: { $feature: layer } }; // same profile you run with
editor.testData = { profileVariableInstances: { $feature: sample } }; // shows the Run button
editor.script = "$feature.state_name";

let errores = 0;
editor.addEventListener("arcgisDiagnosticsChange", (e) => { errores = e.detail.length; });
editor.addEventListener("arcgisScriptChange", (e) => {
  if (errores === 0) saveExpression(e.detail); // only apply a script that validates
});
declare function saveExpression(script: string): void;
```

## Árbol de Decisión

1. **¿Los usuarios escriben Arcade?**
   - Sí → `arcgis-arcade-editor` con el perfil en el que se va a ejecutar.
2. **¿Escriben una cláusula SQL `where`?**
   - `arcgis-sql-expression-editor` y `arcgis-sql-layer-editor` están marcados `@internal` en
     5.1.27: no son API pública. Arma la cláusula con tu propia interfaz y valídala con un
     `queryFeatureCount` sobre la capa.
3. **¿Código genérico (JSON, CSS…)?**
   - `arcgis-code-editor` también es `@internal`; usa Monaco o CodeMirror directamente.

**Por defecto:** `arcgis-arcade-editor`, siempre con perfil.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/coding-components/components/arcgis-arcade-editor";
```

### Imports Dinámicos (CDN)

```html
<!-- El script de módulo del core ya registra los coding components (y charts, mapa, IA):
     un <script> clásico sin type="module" no registra nada -->
<script type="module" src="https://js.arcgis.com/5.1/"></script>
<arcgis-arcade-editor></arcgis-arcade-editor>
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/coding-components/components/arcgis-arcade-editor";
```

## Conceptos Clave

### Concepto 1: El perfil decide qué es válido

`profile` es un perfil predefinido (`{ id: "popup" | "labeling" | "visualization" |
"field-calculation" | …, definitions: { $feature: layer } }`) o una definición propia
(`{ variables: [...], bundles: [...] }`). Con él, el editor conoce las variables, las funciones y
los campos de la capa: medido con 5.1.27, `$feature.NO_EXISTE` se marca con la lista de los campos
reales. **Sin perfil, hasta `$feature` sale como "not defined"**.

### Concepto 2: Los diagnósticos son la validación

`arcgisDiagnosticsChange` manda la lista actual de diagnósticos (vacía cuando el script es
válido); `arcgisScriptChange` manda el texto. No hay propiedad `isValid`: guarda los últimos
diagnósticos y revísalos antes de aplicar el script. Los errores de sintaxis ("Unexpected end of
Arcade expression"), los campos inexistentes y las variables que el perfil no tiene llegan por ahí.

### Concepto 3: Datos de prueba, depurador y asistente

`testData = { profileVariableInstances: { $feature: graphic } }` muestra el botón de ejecutar; sin
`testData` esa parte se oculta. `enableDebugger` (5.1) agrega breakpoints y una consola. El
asistente de Arcade (beta) viene **encendido por defecto** en 5.1 cuando el usuario inició sesión en
una organización de ArcGIS Online que permite IA: pon `disableAssistant = true` si tu app no debe
ofrecerlo. `arcadeAssistant` está deprecado en 5.1.

### Concepto 4: Solo el editor de Arcade es público

En 5.1.27 las declaraciones marcan `arcgis-sql-expression-editor`, `arcgis-sql-layer-editor`,
`arcgis-code-editor` y `arcgis-code-viewer` como `@internal`: se registran y corren, pero no son API
documentada y pueden cambiar en cualquier versión. Los nombres de tipo con `I` de 5.1
(`IPredefinedProfile`, `IEditorProfileDefinition`…) están deprecados en favor de los nombres sin
`I`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Sin perfil

```typescript
// ❌ Anti-patrón
editor.script = "$feature.state_name"; // sin perfil
```

```typescript
// ✅ Correcto
editor.profile = { id: "popup", definitions: { $feature: layer } };
editor.script = "$feature.state_name";
```

**Impacto:** medido con 5.1.27: sin perfil un script correcto recibe "'$feature' is not defined", y
un campo equivocado recibe el mismo mensaje: el usuario no distingue los errores reales.

### Pitfall 2: Editar con un perfil y ejecutar con otro

```typescript
// ❌ Anti-patrón: escrito como etiqueta, usado en un popup (o al revés)
editor.profile = { id: "labeling", definitions: { $feature: layer } };
```

```typescript
// ✅ Correcto: el id del lugar donde va a correr la expresión
editor.profile = { id: "popup", definitions: { $feature: layer } };
```

**Impacto:** medido: `Count(FeatureSetByName($map, "x"))` recibe "'FeatureSetByName' is not
defined" y "'$map' is not defined" en `labeling`; el bundle de acceso a datos solo existe en
algunos perfiles. Un script que valida en un lugar falla en el otro.

### Pitfall 3: Aplicar el script sin mirar los diagnósticos

```typescript
// ❌ Anti-patrón
editor.addEventListener("arcgisScriptChange", (e) => { layer.labelingInfo[0].labelExpressionInfo.expression = e.detail; });
```

```typescript
// ✅ Correcto
let errores = 0;
editor.addEventListener("arcgisDiagnosticsChange", (e) => { errores = e.detail.length; });
editor.addEventListener("arcgisScriptChange", (e) => {
  if (errores === 0) layer.labelingInfo[0].labelExpressionInfo.expression = e.detail;
});
```

**Impacto:** cada tecla mete una expresión a medio escribir en el mapa; no hay un `isValid` en
qué confiar.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos de los componentes editor | `references/api-detail.md` |
| Ejemplos de editor Arcade / SQL | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-arcade` — ejecuta las expresiones autoreadas
- `arcgis-layers` — la capa cuyos campos expone el perfil
- `arcgis-visualization` — adonde llega una expresión de renderer

## Samples de Referencia

- [Coding components](https://developers.arcgis.com/javascript/latest/references/coding-components/)
- [Arcade editor](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Reescrita: la guía 0.1.0 no traía código que funcionara (solo comentarios).
  Perfil real, `testData`, eventos de diagnósticos y de script; medido qué marca el editor con y sin perfil; los
  editores SQL y de código son `@internal` (ya no se ofrecen); asistente encendido por defecto y
  `disableAssistant`; `enableDebugger`; script de módulo de la CDN. En `tests/runtime/casos/arcgis-coding-components.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
