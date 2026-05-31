---
name: arcgis-coding-components
description: >
  Embebe UIs de edición de código con los coding components del ArcGIS Maps SDK
  for JavaScript 5.0: arcgis-arcade-editor (autoría de Arcade con resaltado de
  sintaxis, sugerencias y resultados en vivo) y arcgis-code-editor /
  sql-expression-editor. Usa esta skill cuando el usuario construya un editor
  in-app para Arcade, SQL o código con autocompletado y validación.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/coding-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Coding Components

> **Cuándo usar:** Activa esta skill cuando el usuario construya un editor in-app para Arcade, SQL o
> código con resaltado, autocompletado y validación.

## Resumen

Los coding components proveen UIs de editor (Arcade, SQL, código genérico) con asistencia integrada.

- **Problema que resuelve:** dejar que usuarios finales escriban expresiones/código de forma segura in-app.
- **A quién sirve:** desarrolladores que construyen builders de expresiones y herramientas de admin.
- **Patrón que enseña:** coloca el componente editor, dale un script + contexto, lee el resultado.
- **Qué NO cubre:** ejecutar Arcade (ver `arcgis-arcade`) ni configs de charts (ver `arcgis-charts`).

## Inicio Rápido

```typescript
import "@arcgis/coding-components/dist/components/arcgis-arcade-editor";
// <arcgis-arcade-editor></arcgis-arcade-editor> — define .script y un profile
```

## Árbol de Decisión

1. **¿Editando Arcade?**
   - Sí → `arcgis-arcade-editor` (con sugerencias + resultados en vivo).

2. **¿Editando SQL (cláusulas where)?**
   - Sí → `arcgis-sql-expression-editor`.

3. **¿Editor de código genérico?**
   - Sí → `arcgis-code-editor`.

**Default:** `arcgis-arcade-editor` para autoría de Arcade.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/coding-components/dist/components/arcgis-arcade-editor";
```

### Imports Dinámicos (CDN)

```javascript
// La CDN unificada 5.0 incluye coding-components; referencia el custom element.
const script = "https://js.arcgis.com/5.0/";
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Editor de Arcade

`arcgis-arcade-editor` edita un `script` Arcade con resaltado de sintaxis, autocompletado desde un
profile, y (opcionalmente) resultados en vivo contra una feature de prueba.

### Concepto 2: Los profiles guían las sugerencias

Como el runtime de Arcade, el editor usa un profile para saber qué variables/funciones son válidas,
potenciando el autocompletado y la validación.

### Concepto 3: Editores SQL y genérico

`arcgis-sql-expression-editor` asiste a construir cláusulas `where` contra los campos de una capa;
`arcgis-code-editor` es una superficie de código general.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Sin profile = sin autocompletado útil

```typescript
// ❌ Anti-patrón
// arcgis-arcade-editor sin profile configurado
```

```typescript
// ✅ Correcto
// Provee el mismo profile que usa tu runtime (ej. popup/renderer).
```

**Impacto:** las sugerencias/validación son genéricas o incorrectas.

### Pitfall 2: Editar aquí pero ejecutar con otro profile

```typescript
// ❌ Anti-patrón
// Autorear con profile A, ejecutar con profile B
```

```typescript
// ✅ Correcto
// Mantén consistentes los profiles del editor y del runtime.
```

**Impacto:** scripts que validan en el editor fallan en runtime.

### Pitfall 3: No validar antes de aplicar

```typescript
// ❌ Anti-patrón
layer.renderer.valueExpression = editor.script; // aunque sea inválido
```

```typescript
// ✅ Correcto
// Revisa la validez/diagnósticos del editor antes de aplicar.
```

**Impacto:** expresiones rotas llegan a renderers/popups.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos de los componentes editor | `references/api-detail.md` |
| Ejemplos de editor Arcade / SQL | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-arcade` — ejecuta las expresiones autoreadas
- `arcgis-layers` — campos para editores SQL/where
- `arcgis-visualization` — aplica resultados de valueExpression

## Samples de Referencia

- [Coding components](https://developers.arcgis.com/javascript/latest/references/coding-components/)
- [Arcade editor](https://developers.arcgis.com/javascript/latest/sample-code/coding-arcade-editor/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
