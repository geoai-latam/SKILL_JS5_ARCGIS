# Extended Pitfalls: Knowledge Graphs

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Property/type name mismatches

### Anti-pattern

```text
MATCH (p:person) ... // type is "Person"
```

### Correct

```text
MATCH (p:Person) ...
```

### Impact

Empty results from wrong-cased types.

### Diagnosis

No matches; check the data model's exact type names.

---

## Pitfall 2: Returning entire entities when you need fields

### Anti-pattern

```text
RETURN p  // heavy full entities
```

### Correct

```text
RETURN p.name, p.id  // only needed fields
```

### Impact

Large payloads.

### Diagnosis

Slow queries; project specific fields.

---

## Pitfall 3: Ignoring pagination/streaming

### Anti-pattern

```typescript
// Expecting all results in one synchronous batch
```

### Correct

```typescript
// Use streaming/paged execution for large result sets.
```

### Impact

Memory spikes on big graphs.

### Diagnosis

Browser memory grows; page/stream results.

---

## Pitfall 4: No auth for a secured graph

### Anti-pattern

```typescript
knowledgeGraphService.fetchKnowledgeGraph(securedUrl); // no sign-in
```

### Correct

```typescript
// Authenticate first (see arcgis-authentication).
```

### Impact

403 on fetch/query.

### Diagnosis

Auth errors; sign in.

---

## Pitfall 5: Mixing graph ids across services

### Anti-pattern

```typescript
// Using ids from one graph against another service
```

### Correct

```typescript
// Keep ids scoped to the graph they came from.
```

### Impact

Not-found errors on cross-service ids.

### Diagnosis

Missing entities; verify the id's source graph.
