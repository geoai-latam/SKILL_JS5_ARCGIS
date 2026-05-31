# Extended Pitfalls: Authoring Skills

> These extend the Top 3 in `SKILL.md`. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Heading structure drift between EN and ES

### Anti-pattern

```text
SKILL.md has 20 headings; SKILL.es.md has 19 (you forgot to translate one section).
```

### Correct

```text
Mirror every heading at the same level and order. Translate the text, keep the shape.
```

### Impact

`bilingual-sync.js` fails CI with "Heading count differs".

### Diagnosis

Run `node scripts/bilingual-sync.js --skill=<name>` and read the position it reports.

---

## Pitfall 2: Description too short or too long

### Anti-pattern

```yaml
description: "Maps stuff."
```

### Correct

```yaml
description: >
  Initialize 2D MapView and 3D SceneView with ArcGIS Maps SDK 5.0, covering
  basemaps, navigation, and the Map Components vs Core API decision.
```

### Impact

A vague description triggers poorly; `lint-frontmatter.js` flags <50 or >200 tokens.

### Diagnosis

`node scripts/lint-frontmatter.js --skill=<name>` prints the estimated token count.

---

## Pitfall 3: SKILL.md grows past 300 lines

### Anti-pattern

```text
A 450-line SKILL.md with full API tables inline.
```

### Correct

```text
Keep SKILL.md ≤ 300 lines; move API tables to references/api-detail.md.
```

### Impact

Warning at 300 lines, hard error at 500 — the latter blocks the merge.

### Diagnosis

`validate-skills.js` reports the body line count.

---

## Pitfall 4: Referencing a non-existent related skill

### Anti-pattern

```markdown
## Related Skills
- `arcgis-does-not-exist`
```

### Correct

```markdown
## Related Skills
- `arcgis-core-maps`
```

### Impact

`validate-skills.js` errors: "Related Skills references non-existent skill".

### Diagnosis

The validator lists the offending reference; check the catalog in §34.

---

## Pitfall 5: Forgetting the eval JSON

### Anti-pattern

```text
Ship a skill without tests/evals/<name>.eval.json.
```

### Correct

```text
Provide ≥5 should_trigger and ≥3 should_not_trigger prompts (bilingual).
```

### Impact

Triggering quality is unmeasured; the skill may never activate in practice.

### Diagnosis

Check that `tests/evals/<name>.eval.json` exists and parses.
