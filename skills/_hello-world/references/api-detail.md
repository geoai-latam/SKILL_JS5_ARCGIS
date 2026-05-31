# Reference: Frontmatter Schema

Full field reference for every skill's frontmatter. The `lint-frontmatter.js` script
enforces these rules (Plan Maestro §5).

## Table of Contents

- [Required fields](#required-fields)
- [Optional fields](#optional-fields)
- [Enumerations](#enumerations)

---

## Required fields

| Field | Type | Rule |
|---|---|---|
| `name` | `string` | kebab-case; must equal the directory name |
| `description` | `string` | ~50-200 tokens; primary trigger text |
| `lang` | `string` | `en` in `SKILL.md`, `es` in `SKILL.es.md` |
| `version` | `string` | valid semver (e.g. `0.1.0`) |
| `status` | `string` | `stable` \| `beta` \| `deprecated` |
| `sdk_version` | `string` | valid semver range (e.g. `">=5.0 <6.0"`) |
| `created` | `string` | ISO date `YYYY-MM-DD` |
| `updated` | `string` | ISO date `YYYY-MM-DD`; must be ≥ `created` |
| `category` | `string` | one of the [enumerations](#enumerations) |
| `tags` | `string[]` | at least 3 entries |
| `maintainer` | `string` | e.g. `"GeoAI LATAM"` |
| `license` | `string` | e.g. `MIT` |

## Optional fields

| Field | Type | Description |
|---|---|---|
| `requires` | `string[]` | sibling skills this one depends on |
| `packages` | `string[]` | npm packages the skill assumes installed |
| `agents` | `string[]` | verified agents (claude-code, cursor, ...) |

## Enumerations

**`category`:** `core`, `layers`, `visualization`, `interaction`, `widgets`, `spatial`,
`services`, `specialized`, `new-in-5.0`.

**`status`:** `stable`, `beta`, `deprecated`.
