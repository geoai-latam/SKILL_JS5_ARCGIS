# Extended Pitfalls: Knowledge Graphs

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured items come from `tests/runtime/casos/arcgis-knowledge-graphs.ts` without a live graph (token required).

## Pitfall 1: Type and property names that do not match the data model

### Anti-pattern

```text
MATCH (p:supplier) RETURN p   // the type is "Supplier"
```

### Correct

```typescript
const names = graph.dataModel.entityTypes.map((t) => t.name); // use these exact strings
```

### Impact

No matches and no error (documented behavior of openCypher labels; not measured).

### Diagnosis

Empty `resultRowsStream`; compare the labels against `dataModel.entityTypes`.

---

## Pitfall 2: Passing a plain object as the query

### Anti-pattern

```typescript
await knowledgeGraphService.executeQuery(graph, { openCypherQuery: "MATCH (n) RETURN n LIMIT 10" });
```

### Correct

```typescript
await knowledgeGraphService.executeQuery(graph, new GraphQuery({ openCypherQuery: "MATCH (n) RETURN n LIMIT 10" }));
```

### Impact

TS2345 in 5.1: the parameter is the `GraphQuery` class. Esri's own doc example uses the plain object.

### Diagnosis

"missing the following properties from type 'GraphQuery': declaredClass, ...".

---

## Pitfall 3: Never reading the stream

### Anti-pattern

```typescript
const result = await knowledgeGraphService.executeQueryStreaming(graph, query);
console.log(result.resultRows); // undefined: streaming results have no resultRows
```

### Correct

```typescript
const reader = result.resultRowsStream.getReader();
for (let c = await reader.read(); !c.done; c = await reader.read()) handle(c.value);
```

### Impact

Nothing is read; the rows only exist in `resultRowsStream`.

### Diagnosis

`resultRows` is undefined on a `GraphQueryStreamingResult`.

---

## Pitfall 4: Waiting forever on a secured graph

### Anti-pattern

```typescript
const graph = await knowledgeGraphService.fetchKnowledgeGraph(securedUrl); // no auth, no timeout
```

### Correct

```typescript
const layer = new KnowledgeGraphLayer({ url: securedUrl });
const controller = new AbortController();
setTimeout(() => controller.abort(), 15000);
await layer.load({ signal: controller.signal }); // or configure auth before fetching
```

### Impact

Measured: `fetchKnowledgeGraph` stayed pending for 15 s with the sign-in dialog in the DOM; it accepts no `signal`.
`KnowledgeGraphLayer.load({ signal })` rejected with `AbortError`.

### Diagnosis

A spinner that never ends and a sign-in dialog the user may not expect.

---

## Pitfall 5: Treating a row as an object

### Anti-pattern

```typescript
for (const row of chunk.value) console.log(row.s.properties.Name); // rows are arrays
```

### Correct

```typescript
for (const [s, p] of chunk.value) console.log(s.properties.Name, p?.properties?.Name); // RETURN s, p
```

### Impact

`undefined` reads: each row is an array in the order of the `RETURN` clause.

### Diagnosis

Values appear only when indexed by position.
