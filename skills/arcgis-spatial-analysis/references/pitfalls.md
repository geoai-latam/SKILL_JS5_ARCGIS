# Extended Pitfalls: Spatial Analysis

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Not handling job failure states

### Anti-pattern

```typescript
const job = await geoprocessor.submitJob(url, params);
await job.waitForJobCompletion(); // assume success
```

### Correct

```typescript
const job = await geoprocessor.submitJob(url, params);
const info = await job.waitForJobCompletion();
if (info.jobStatus !== "job-succeeded") throw new Error(info.jobStatus);
```

### Impact

You read outputs from a failed job.

### Diagnosis

Empty/garbage outputs; check `jobStatus`.

---

## Pitfall 2: Sending wrong geometry/feature JSON

### Anti-pattern

```typescript
geoprocessor.execute(url, { Input_Features: graphic }); // expects FeatureSet JSON
```

### Correct

```typescript
geoprocessor.execute(url, { Input_Features: featureSet.toJSON() });
```

### Impact

The tool rejects the input.

### Diagnosis

Type/parse errors from the GP service; send proper JSON.

---

## Pitfall 3: Statistics without outStatisticFieldName

### Anti-pattern

```typescript
q.outStatistics = [{ statisticType: "sum", onStatisticField: "POP" }];
```

### Correct

```typescript
q.outStatistics = [{ statisticType: "sum", onStatisticField: "POP", outStatisticFieldName: "total" }];
```

### Impact

You can't reliably read the result field.

### Diagnosis

Unknown result attribute name; always set the alias.

---

## Pitfall 4: Long jobs blocking UX with no feedback

### Anti-pattern

```typescript
await job.waitForJobCompletion(); // user sees nothing for minutes
```

### Correct

```typescript
// Poll jobStatus and show progress; allow cancel.
```

### Impact

App feels hung during long analysis.

### Diagnosis

Users abandon; add progress UI.

---

## Pitfall 5: Ignoring service auth/quotas

### Anti-pattern

```typescript
geoprocessor.execute(securedGpUrl, params); // no token
```

### Correct

```typescript
// Authenticate (API key / OAuth) before calling secured GP services.
```

### Impact

403 / quota errors.

### Diagnosis

Auth error responses; see `arcgis-authentication`.
