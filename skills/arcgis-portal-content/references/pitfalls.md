# Extended Pitfalls: Portal Content

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Wrong portal URL for Enterprise

### Anti-pattern

```typescript
const portal = new Portal(); // defaults to ArcGIS Online
```

### Correct

```typescript
const portal = new Portal({ url: "https://gis.myorg.com/portal" });
```

### Impact

You query the wrong organization.

### Diagnosis

Missing org items; set `portal.url`.

---

## Pitfall 2: Over-broad queries

### Anti-pattern

```typescript
new PortalQueryParams({ query: "water" }); // matches everything mentioning water
```

### Correct

```typescript
new PortalQueryParams({ query: 'water AND type:"Feature Service" AND owner:myorg' });
```

### Impact

Huge, noisy result sets.

### Diagnosis

Too many results; tighten the query.

---

## Pitfall 3: Assuming item.url is always present

### Anti-pattern

```typescript
const layer = new FeatureLayer({ url: item.url }); // some item types have no url
```

### Correct

```typescript
const layer = await Layer.fromPortalItem({ portalItem: item });
```

### Impact

`undefined` url for non-service item types.

### Diagnosis

Layer fails to construct; use `Layer.fromPortalItem`.

---

## Pitfall 4: Not handling token expiry

### Anti-pattern

```typescript
// Long-lived session assuming the token never expires
```

### Correct

```typescript
// IdentityManager refreshes tokens; handle re-auth on 498/499.
```

### Impact

Requests start failing after the token expires.

### Diagnosis

Sudden 498/499 errors; refresh credentials.

---

## Pitfall 5: Querying groups without membership

### Anti-pattern

```typescript
await group.queryItems(); // private group, not a member
```

### Correct

```typescript
// Ensure the signed-in user belongs to the group.
```

### Impact

Empty/forbidden results for private groups.

### Diagnosis

No group items; verify membership/permissions.
