# ArcGIS JS 5 Skills

Español · [English](./README.md)

Una librería bilingüe (ES/EN) de **Agent Skills** para el
[ArcGIS Maps SDK for JavaScript 5.1](https://developers.arcgis.com/javascript/). Cada skill
le da a un agente de código (Claude Code, Cursor, GitHub Copilot, Codex, OpenCode) guía
precisa y actualizada para construir aplicaciones web de mapas con el SDK.

## Por qué

El release 5.0 (febrero 2026) cambió mucho: CDN unificada, imports ESM vía
`$arcgis.import()`, **todos los widgets deprecados** en favor de Map Components, la eliminación
del namespace de tipos `__esri`, y nuevas capas como `GaussianSplatLayer`. Estas skills
codifican esos patrones para que los agentes dejen de sugerir modismos de 4.x.

## Cómo funciona el modelo bilingüe

Las Agent Skills se activan sobre **`SKILL.md`** — ese es el archivo que lee el runtime (Claude
Code, etc.) y su `description` es el trigger. `SKILL.md` está en inglés, así que el agente
**selecciona y razona desde la skill en inglés** y puede responderle al usuario en español (o
cualquier idioma) como siempre.

`SKILL.es.md` es un **acompañante en español sincronizado** para lectores y revisores humanos — no
es una segunda skill que se auto-active. El chequeo `bilingual-sync` mantiene ambos archivos
alineados estructuralmente (misma forma de headings, mismos bloques de código). En resumen: **los
docs son bilingües; la activación la maneja el `SKILL.md` en inglés.**

## Estado

**v1.2.0 — 36 skills, todas validadas contra el SDK 5.1.27.** Las 35 de la v1.1.0 más `arcgis-parquet`
(`ParquetLayer`, beta), agregada con el mismo método. Se revisaron una por una:

- **Que compile.** Cada bloque de código de las skills (1110) se compila contra los tipos reales
  de 5.1.27, y cada import `@arcgis/*` se coteja con el `exports` del paquete (una ruta que tsc
  acepta puede fallar en Vite y en Node).
- **Que corra.** Cada skill tiene un caso de runtime en `tests/runtime/casos/` que ejecuta lo que
  la skill afirma en Chromium, contra servicios públicos de Esri (y, para Parquet, archivos pequeños
  generados), y lee el resultado (los píxeles, en las de visualización).
- **Que no sea relleno.** Los pitfalls que resultaron falsos se quitaron; los fallos silenciosos
  que aparecieron (sin error y con resultado equivocado) se agregaron con su medida.

También queda escrito lo que no se pudo medir: todo lo que pide un usuario con sesión (respuestas
del LLM del assistant, trazados de utility network, consultas a knowledge graphs, exportar un
print). El informe completo está en [`docs/validacion/INFORME.md`](./docs/validacion/INFORME.md) y
el registro por skill en [`docs/validacion/README.md`](./docs/validacion/README.md). El catálogo
está en [`skills/README.md`](./skills/README.md).

Hay un catálogo parecido en
[SaschaBrunnerCH/arcgis-maps-sdk-js-ai-context](https://github.com/SaschaBrunnerCH/arcgis-maps-sdk-js-ai-context)
(SDK 5.0). Este apunta a 5.1.27 y valida cada bloque de código y cada afirmación contra el SDK real.

## Instalación

```bash
# Todas las skills, vía Skills CLI
npx skills add geoai-latam/SKILL_JS5_ARCGIS

# Una skill específica
npx skills add geoai-latam/SKILL_JS5_ARCGIS --skill arcgis-starter-app

# Marketplace de Claude Code (requiere un .claude-plugin/marketplace.json — ver abajo)
# /plugin marketplace add geoai-latam/SKILL_JS5_ARCGIS
```

## Desarrollo

```bash
pnpm install            # instala tooling + el SDK (compartido por los smoke tests)
pnpm new-skill arcgis-xyz --category=core
pnpm run validate-all   # validate-skills + lint-frontmatter + bilingual-sync
pnpm run smoke          # type-checkea todos los snippets contra los tipos reales del SDK
pnpm run test:unit      # tests unitarios de los validadores
pnpm run lint           # markdownlint
```

## Estructura del repositorio

- `skills/` — una carpeta por skill (`SKILL.md`, `SKILL.es.md`, `AGENTS.md`, `references/`, `scripts/`)
- `scripts/` — validadores y los runners de smoke/eval
- `.skills-cli/` — el generador `new-skill` y sus plantillas
- `tests/` — `unit/` (validadores), `evals/` (prompts de triggering), `integration/` (Playwright)
- `docs/planning/v2.md` — el plan maestro

## Licencia

[MIT](./LICENSE) © GeoAI LATAM
