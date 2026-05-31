# Examples: Authoring a Skill

Three end-to-end examples of how to use this reference skill.

## Example 1: Scaffold a new skill

**Use case:** you want to start `arcgis-time-animation` from a valid skeleton.

```bash
pnpm new-skill arcgis-time-animation
# → creates skills/arcgis-time-animation/ with SKILL.md, SKILL.es.md,
#   AGENTS.md, references/*, scripts/scaffold.sh, and an eval JSON.
node scripts/validate-skills.js --skill=arcgis-time-animation
```

**Notes:**

- The generated skill passes `validate-skills.js` out of the box.
- Replace every `TODO` placeholder before opening a PR.

---

## Example 2: A minimal type-checked snippet

**Use case:** prove the smoke pipeline type-checks SDK imports.

```typescript
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";

const map = new Map({ basemap: "topo-vector" });
const view = new MapView({ map, container: "viewDiv", zoom: 3 });
export { view };
```

**Notes:**

- `node scripts/smoke-test.mjs --skill=<name>` runs `tsc --noEmit` on this.
- A wrong import path fails the smoke test immediately.

---

## Example 3: Keeping EN and ES in sync

**Use case:** you added a "Performance" section to `SKILL.md`.

```bash
# Add the mirror section to SKILL.es.md, then verify structure:
node scripts/bilingual-sync.js --skill=<name>
```

**Notes:**

- Both files must end with the same heading structure and code-block count.
- Heading text is translated; only the structure is compared.
