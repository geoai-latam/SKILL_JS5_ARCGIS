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

## Pitfall 3: Over-scoped API key

### Anti-pattern

```typescript
// A single key with all privileges shipped to every app
```

### Correct

```typescript
// Scope keys to the minimum services and referrers needed.
```

### Impact

A leaked broad key is high-risk.

### Diagnosis

Audit key scopes/referrers; tighten them.

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

## Pitfall 5: Assuming API key works for secured layers

### Anti-pattern

```typescript
esriConfig.apiKey = key; // then editing a private org layer
```

### Correct

```typescript
// Private org content needs OAuth user sign-in, not just a key.
```

### Impact

403 on private content with only a key.

### Diagnosis

Auth errors on private layers; switch to OAuth.
