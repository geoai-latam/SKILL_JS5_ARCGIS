# Examples: Editing

## Example 1: Add a feature

**Use case:** create a new inspection point.

```typescript
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";

const feature = new Graphic({
  geometry: new Point({ longitude: -74.08, latitude: 4.6 }),
  attributes: { STATUS: "open" },
});
const result = await layer.applyEdits({ addFeatures: [feature] });
console.log("new id", result.addFeatureResults[0].objectId);
```

**Notes:**

- Do not set OBJECTID on adds — the service assigns it.
- Check `addFeatureResults[0].error` for failures.

---

## Example 2: Update and delete with error checks

**Use case:** mark a feature done and remove another.

```typescript
import Graphic from "@arcgis/core/Graphic.js";

const update = new Graphic({ attributes: { OBJECTID: 42, STATUS: "done" } });
const r = await layer.applyEdits({
  updateFeatures: [update],
  deleteFeatures: [{ objectId: 99 }],
});
r.updateFeatureResults.forEach((res) => { if (res.error) console.error(res.error); });
```

**Notes:**

- Updates require `OBJECTID`.
- Deletes accept `{ objectId }` objects.

---

## Example 3: The editor component

**Use case:** a full editing UI with no custom code.

```html
<arcgis-map item-id="<webmap-id>">
  <arcgis-editor reference-element="arcgis-map" position="top-right"></arcgis-editor>
</arcgis-map>
```

**Notes:**

- `arcgis-editor` replaces the deprecated `Editor` widget.
- It reads editable layers from the bound map.
