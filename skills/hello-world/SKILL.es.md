---
name: hello-world
description: >
  Skill de referencia y plantilla gold-standard para la librería de skills del
  ArcGIS Maps SDK for JavaScript 5.0. Demuestra la estructura canónica de
  archivos, el formato bilingüe EN/ES, el schema de frontmatter, el progressive
  disclosure y un snippet type-checked. Usa esta skill como plano al crear o
  revisar cualquier skill arcgis-*, o cuando necesites entender cómo se organiza
  una skill de este repositorio.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - reference
  - template
  - gold-standard
  - bilingual
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Hello World — Skill de Referencia

> **Cuándo usar:** Activa esta skill cuando necesites la estructura canónica de una skill
> de este repositorio — como plano para crear una nueva skill `arcgis-*` o como checklist
> para revisarla.

## Resumen

Esta es la skill de referencia gold-standard para la librería de skills del ArcGIS Maps
SDK for JavaScript 5.0. Existe para copiarse, no para que la consuma el usuario final.

- **Problema que resuelve:** mantiene cada skill estructuralmente idéntica para que los
  validadores, bilingual-sync y smoke tests pasen de forma uniforme.
- **A quién sirve:** autores y revisores de skills (humanos o agente).
- **Patrón que enseña:** progressive disclosure — un `SKILL.md` corto, con el detalle
  movido a `references/` y el código ejecutable en `scripts/`.
- **Qué NO cubre:** funcionalidad real de ArcGIS. Para mapas reales, ver
  `arcgis-core-maps`; para scaffolding de proyectos, ver `arcgis-starter-app`.

## Inicio Rápido

```typescript
// La forma mínima de un snippet type-checked. El smoke test corre `tsc --noEmit`
// contra los tipos reales del SDK, así que el import de abajo debe resolver.
import Map from "@arcgis/core/Map.js";

const map = new Map({ basemap: "topo-vector" });
export { map };
```

## Árbol de Decisión

1. **¿Estás creando una skill nueva desde cero?**
   - Sí → copia esta carpeta con `pnpm new-skill <name>` y reemplaza el contenido.
   - No → probablemente quieres una skill `arcgis-*` real.

2. **¿Tu tarea está en español?**
   - Sí → el agente lee `SKILL.es.md`.
   - No → el agente lee `SKILL.md`.

**Default:** empieza desde `pnpm new-skill`, nunca copiando a mano, para que el frontmatter quede válido.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import Map from "@arcgis/core/Map.js";
```

### Imports Dinámicos (CDN)

```javascript
const Map = await $arcgis.import("@arcgis/core/Map.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Progressive disclosure

El agente lee primero la metadata, luego `SKILL.md`, y solo abre `references/` bajo demanda.
Mantén `SKILL.md` por debajo de 300 líneas; mueve tablas de API y ejemplos largos a `references/`.

### Concepto 2: Espejo bilingüe

`SKILL.md` y `SKILL.es.md` deben compartir la misma estructura de headings (mismos niveles,
mismo orden) y el mismo número de bloques de código. Los headings se traducen; el código queda en inglés.

### Concepto 3: Snippets verificables

Cada `scripts/snippet-*.ts` se type-checkea en CI. Si un import o tipo está mal, el
smoke test falla — así los ejemplos nunca se desincronizan de la API real del SDK.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Omitir la extensión `.js` en los imports

```typescript
// ❌ Anti-patrón
import Map from "@arcgis/core/Map";
```

```typescript
// ✅ Correcto
import Map from "@arcgis/core/Map.js";
```

**Impacto:** los subpath exports del SDK 5.0 no resuelven y el build lanza
"Cannot find module", así que no se renderiza nada.

### Pitfall 2: Editar un solo idioma

```text
// ❌ Anti-patrón
Editar SKILL.md, mergear el PR, dejar SKILL.es.md desactualizado.
```

```text
// ✅ Correcto
Editar ambos archivos juntos; bilingual-sync falla CI ante drift estructural.
```

**Impacto:** el usuario hispanohablante recibe guía desactualizada y CI bloquea el merge.

### Pitfall 3: Hardcodear el API key

```typescript
// ❌ Anti-patrón
esriConfig.apiKey = "AAPK_real_key_pasted_here";
```

```typescript
// ✅ Correcto
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Impacto:** el secreto se filtra al historial de git y gitleaks bloquea el commit.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Referencia completa de campos del frontmatter | `references/api-detail.md` |
| Ejemplos de autoría end-to-end | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-starter-app` — scaffolding de un proyecto real
- `arcgis-core-maps` — construir un mapa o escena real

## Samples de Referencia

- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)
- [intro-mapview](https://developers.arcgis.com/javascript/latest/sample-code/intro-mapview/)

## Changelog

- **0.1.0** (2026-05-31): Skill de referencia inicial.
