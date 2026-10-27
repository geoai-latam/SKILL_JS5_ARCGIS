---
name: arcgis-starter-app
description: >
  Genera desde cero un proyecto web con ArcGIS Maps SDK for JavaScript 5.0 usando
  Vite y TypeScript (strict). Cubre la instalación de dependencias, el API key vía
  variables de entorno, el registro de Map Components, y la integración con
  frameworks: vanilla TS, React 19 y Angular. Usa esta skill cuando el usuario
  inicie un proyecto ArcGIS, pregunte cómo configurar el SDK o integrarlo.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - scaffolding
  - vite
  - typescript
  - setup
  - framework
packages:
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
  - "@esri/calcite-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# App Inicial

> **Cuándo usar:** Activa esta skill cuando el usuario inicie un proyecto ArcGIS Maps SDK 5.0,
> configure dependencias, defina el API key, o integre el SDK con Vite, React 19 o Angular.

## Resumen

Esta skill arranca un proyecto SDK 5.0 funcional y lo cablea correctamente para que el primer mapa renderice.

- **Problema que resuelve:** ir de carpeta vacía a una app ArcGIS corriendo y tipada en minutos.
- **A quién sirve:** desarrolladores (en especial SEs LATAM) que inician apps web ArcGIS nuevas.
- **Patrón que enseña:** Vite + TS strict, Map-Components-primero, API key vía `import.meta.env`.
- **Qué NO cubre:** construir el mapa (ver `arcgis-core-maps`) ni agregar datos (`arcgis-layers`).

## Inicio Rápido

```bash
bash scripts/scaffold.sh my-arcgis-app
cd my-arcgis-app
cp .env.example .env   # agrega VITE_ARCGIS_API_KEY
pnpm dev
```

## Árbol de Decisión

1. **¿Qué framework?**
   - Vanilla TS → usa el scaffold tal cual.
   - React 19+ → usa Map Components directo (custom elements + event listeners).
   - Angular → agrega `CUSTOM_ELEMENTS_SCHEMA`; importa el CSS de los componentes explícitamente.

2. **¿React por debajo de 19?**
   - Sí → considera la Core API; Map Components apuntan a soporte moderno de custom elements.
   - No → Map Components.

**Default:** Vite + vanilla TS con Map Components.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import esriConfig from "@arcgis/core/config.js";
```

### Imports Dinámicos (CDN)

```javascript
const esriConfig = await $arcgis.import("@arcgis/core/config.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Vite + TypeScript strict

El scaffold usa la plantilla `vanilla-ts` de Vite con `strict: true` y
`moduleResolution: "bundler"`, que los package exports del SDK requieren.

### Concepto 2: API key vía entorno

Define `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY`. Vite solo expone variables con
prefijo `VITE_`. Guarda la key real en `.env` (git-ignored) y publica `.env.example`.

### Concepto 3: Registrar componentes

Los Map Components son custom elements registrados vía side-effect imports. Importa solo los
componentes que uses para que el bundler haga tree-shaking del resto.

## Pitfalls Comunes (Top 3)

### Pitfall 1: moduleResolution incorrecto

```jsonc
// ❌ Anti-patrón
{ "compilerOptions": { "moduleResolution": "node" } }
```

```jsonc
// ✅ Correcto
{ "compilerOptions": { "moduleResolution": "bundler" } }
```

**Impacto:** `Cannot find module '@arcgis/...'` porque los subpath exports no resuelven.

### Pitfall 2: Hardcodear el API key

```typescript
// ❌ Anti-patrón
esriConfig.apiKey = "AAPK_real_key";
```

```typescript
// ✅ Correcto
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Impacto:** el secreto se filtra al historial de git; el secret scanning / gitleaks bloquea el push.

### Pitfall 3: Usar el wrapper de React deprecado en React 19

```typescript
// ❌ Anti-patrón
import { ArcgisMap } from "@arcgis/map-components-react";
```

```typescript
// ✅ Correcto
import "@arcgis/map-components/components/arcgis-map"; // usa el custom element + eventos onArcgis*
```

**Impacto:** capa wrapper innecesaria; React 19 soporta custom elements de forma nativa.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Detalles de config / tsconfig / env | `references/api-detail.md` |
| Setups de React 19 y Angular | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — construye el mapa tras el scaffold
- `arcgis-widgets-ui` — agrega UI con Calcite + componentes
- `arcgis-performance` — optimiza el bundle

## Samples de Referencia

- [Get started (npm)](https://developers.arcgis.com/javascript/latest/get-started-npm/)
- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
