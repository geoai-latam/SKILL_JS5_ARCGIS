# Extended Pitfalls: Authentication

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Committing the .env with the real key

### Anti-pattern

```bash
git add .env # contains VITE_ARCGIS_API_KEY=AAPK...
```

### Correct

```bash
echo ".env" >> .gitignore # commit only .env.example
```

### Impact

Leaked, billable key; forced rotation.

### Diagnosis

Secret scanning flags the key; rotate it.

---

## Pitfall 2: Wrong redirect URI registered

### Anti-pattern

```typescript
// App registered with a redirect that doesn't match the deployed origin
```

### Correct

```typescript
// Register the exact origin(s) in the app's OAuth settings.
```

### Impact

OAuth redirect fails / blocked.

### Diagnosis

Redirect mismatch error; fix the registered URIs.

---

## Pitfall 3: Over-scoped, unrestricted or forgotten API key

### Anti-pattern

```typescript
// One key with every privilege, no referrer restriction, expiring in a year nobody tracks
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
```

### Correct

```typescript
// On the API key credentials item: minimum privileges, referrers = your domains,
// key 1 and key 2 with staggered expirations; swap the env value before one expires.
```

### Impact

The key is public by construction (it ships in the bundle), so its restrictions are the only
protection. An expired key, or a legacy `AAPK…` key after 2026-06-27, answers "Invalid Token"
(measured) and the whole app loses basemaps and geocoding at once.

### Diagnosis

`Invalid Token` on every location-service call; check the credential's expiration and type.

---

## Pitfall 4: Not handling sign-in cancel

### Anti-pattern

```typescript
await IdentityManager.getCredential(url); // user closes popup → unhandled rejection
```

### Correct

```typescript
try { await IdentityManager.getCredential(url); } catch { /* user cancelled */ }
```

### Impact

Unhandled promise rejection on cancel.

### Diagnosis

Console errors when the user dismisses sign-in; catch it.

---

## Pitfall 5: Using a key for per-user permissions

### Anti-pattern

```typescript
esriConfig.apiKey = key; // then editing a private org layer
```

### Correct

```typescript
// A key can be granted specific private items (item access on the API key credentials),
// but it is one identity for every visitor. Per-user rights (who edits what) need OAuth.
```

### Impact

Either a 403 (the item was not granted to the key) or, worse, every visitor gets the same rights.

### Diagnosis

Auth errors on private layers, or edits attributed to the app instead of a person: switch to OAuth.
