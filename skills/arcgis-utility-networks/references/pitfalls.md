# Extended Pitfalls: Utility Networks

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Stale topology after edits

### Anti-pattern

```typescript
// Editing features then tracing without updating the network topology
```

### Correct

```typescript
// Ensure the network topology is validated/enabled before tracing edited areas.
```

### Impact

Traces reflect old connectivity.

### Diagnosis

Unexpected trace results near edits; validate topology.

---

## Pitfall 2: Wrong trace configuration

### Anti-pattern

```typescript
trace.trace(url, { traceType: "connected" }); // missing required config
```

### Correct

```typescript
trace.trace(url, { traceType: "connected", traceConfigurationGlobalId: cfgId });
```

### Impact

Trace errors or returns unintended scope.

### Diagnosis

Config-required errors; supply the configuration id.

---

## Pitfall 3: Auth/permissions on the network service

### Anti-pattern

```typescript
new UtilityNetwork({ layerUrl: securedUrl }); // no sign-in
```

### Correct

```typescript
// Authenticate; utility networks are usually secured.
```

### Impact

403 on load/trace.

### Diagnosis

Auth errors; see `arcgis-authentication`.

---

## Pitfall 4: Ignoring barriers

### Anti-pattern

```typescript
// Expecting an isolation trace without barriers
```

### Correct

```typescript
// Add barriers/filters so isolation traces stop correctly.
```

### Impact

Over-broad isolation results.

### Diagnosis

Isolation includes too much; add barriers.

---

## Pitfall 5: Large traces blocking the UI

### Anti-pattern

```typescript
// Awaiting a huge trace with no progress feedback
```

### Correct

```typescript
// Show progress; consider server-side limits for large networks.
```

### Impact

App feels frozen on big traces.

### Diagnosis

Long unresponsive waits; add feedback.
