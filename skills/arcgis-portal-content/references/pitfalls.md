# Extended Pitfalls: Portal Content

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 against ArcGIS Online in `tests/runtime/casos/arcgis-portal-content.ts`.

## Pitfall 1: Asking for more than 100 per page

### Anti-pattern

```typescript
new PortalQueryParams({ query, num: 500 }); // "get everything in one call"
```

### Correct

```typescript
new PortalQueryParams({ query, num: 100 }); // then page with nextQueryParams
```

### Impact

Measured: asked for 250, got 100, with no error or warning.

### Diagnosis

Lists that stop at exactly 100; page until `nextQueryParams.start === -1`.

---

## Pitfall 2: Over-broad queries and the 10000 window

### Anti-pattern

```typescript
new PortalQueryParams({ query: "water", start: 10001 });
```

### Correct

```typescript
new PortalQueryParams({ query: 'water AND type:"Feature Service" AND owner:myorg' });
```

### Impact

Measured: `"water"` reported `total` exactly `10000` (it is a cap, not a count), and `start` 10001 with `num` 10
threw `Result window is too large, start + num must be less than or equal to 10000`.

### Diagnosis

A `total` of exactly 10000, or that error: narrow the query by type, owner, tags or extent.

---

## Pitfall 3: Building a layer from `item.url`

### Anti-pattern

```typescript
const layer = new FeatureLayer({ url: item.url }); // empty for a web map, and loses the item's popups and renderer
```

### Correct

```typescript
const layer = await Layer.fromPortalItem({ portalItem: item }); // for layer items only
```

### Impact

Measured: a web map item had no `url`; a Feature Service item had one, and `Layer.fromPortalItem` returned a
`feature` layer configured from the item.

### Diagnosis

`undefined` URLs or layers that ignore the item's saved styling.

---

## Pitfall 4: Wrong portal URL for Enterprise

### Anti-pattern

```typescript
const portal = new Portal(); // https://www.arcgis.com
```

### Correct

```typescript
const portal = new Portal({ url: "https://gis.myorg.com/portal" });
```

### Impact

Measured: `new Portal()` loads `https://www.arcgis.com`, so you search the wrong organization.

### Diagnosis

Missing org items; check `portal.url`.

---

## Pitfall 5: Treating "does not exist" as "does not exist"

### Anti-pattern

```typescript
await item.load().catch(() => showNotFound()); // the item may exist but be private
```

### Correct

```typescript
await item.load().catch((e: Error) => {
  // "Item does not exist or is inaccessible.": offer sign-in before saying it is gone
  showNotFoundOrSignIn(e);
});
```

### Impact

Measured: a missing id rejected with `Item does not exist or is inaccessible.` and `loadStatus` `"failed"`, without
a sign-in prompt. The server uses that one message for both cases.

### Diagnosis

Users who swear the item exists; check whether they are signed in.
