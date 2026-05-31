# Contribuir

Español · [English](./CONTRIBUTING.md)

Gracias por ayudar a construir la librería de skills de ArcGIS JS 5. Esta guía cubre cómo
agregar o corregir una skill.

## Requisitos

- Node.js 22+ (ver `.nvmrc`)
- pnpm 10+ (`npm i -g pnpm` o vía corepack)

```bash
pnpm install
```

## Agregar una skill nueva

1. Genérala: `pnpm new-skill arcgis-xyz --category=<categoría>`.
2. Reemplaza cada `TODO` en `skills/arcgis-xyz/` (tanto `SKILL.md` como `SKILL.es.md`).
3. Mantén `SKILL.md` por debajo de 300 líneas; mueve el detalle a `references/`.
4. Espeja la estructura de headings en `SKILL.es.md` (traduce el texto, conserva la forma).
5. Si la skill incluye código, agrega `scripts/snippet-*.ts` para que el smoke test lo type-checkee.
6. Llena `tests/evals/arcgis-xyz.eval.json` con ≥5 `should_trigger` y ≥3 `should_not_trigger`.

## Validar localmente antes del PR

```bash
pnpm run validate-skills -- --skill=arcgis-xyz
pnpm run lint-frontmatter -- --skill=arcgis-xyz
pnpm run bilingual-sync -- --skill=arcgis-xyz
pnpm run smoke -- --skill=arcgis-xyz
pnpm run lint
```

## Reglas de la casa

- TypeScript strict, solo ESM. Nada de AMD / `require()`, ni namespace `__esri`.
- Usa la extensión `.js` en los imports de `@arcgis/core/*`.
- Map Components primero; documenta los widgets deprecados solo como fallback histórico.
- Calcite es `^5.0` (no 3.x).
- Nunca hardcodees API keys — usa `import.meta.env.VITE_ARCGIS_API_KEY`.
- No pegues documentación oficial literal; reformula.

## Pull requests

- Una skill (o un fix puntual) por PR.
- CI debe estar en verde (validate + smoke + lint + tests unitarios).
- Actualiza `CHANGELOG.md`.
