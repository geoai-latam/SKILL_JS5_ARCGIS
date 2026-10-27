# Examples: Portal Content

## Example 1: Load an item by id

**Use case:** read a saved item's metadata.

```typescript
import PortalItem from "@arcgis/core/portal/PortalItem.js";

const item = new PortalItem({ id: "<item-id>" });
await item.load();
console.log(item.title, item.type);
```

**Notes:**

- `await load()` before reading metadata.
- Works for public items without sign-in.

---

## Example 2: Query web maps

**Use case:** list an owner's web maps.

```typescript
import Portal from "@arcgis/core/portal/Portal.js";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams.js";

const portal = new Portal();
await portal.load();
const result = await portal.queryItems(
  new PortalQueryParams({ query: 'type:"Web Map" AND owner:esri', num: 20, sortField: "modified", sortOrder: "desc" }),
);
const titles = result.results.map((i) => i.title);
```

**Notes:**

- Without `sortOrder: "desc"`, `modified` sorts oldest first (measured).
- Sign in to include private items.

---

## Example 3: Render a webmap by id (component)

**Use case:** one-line rendering of a saved webmap.

```html
<arcgis-map item-id="<webmap-item-id>"></arcgis-map>
```

**Notes:**

- The component loads the item and its layers.
- No manual `PortalItem` handling needed for rendering.
