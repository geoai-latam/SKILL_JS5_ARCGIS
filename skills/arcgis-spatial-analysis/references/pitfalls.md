# Extended Pitfalls: Spatial Analysis

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 against public GP services in `tests/runtime/casos/arcgis-spatial-analysis.ts`.

## Pitfall 1: Using execute on an asynchronous service

### Anti-pattern

```typescript
const r = await geoprocessor.execute(asyncGpUrl, params);
```

### Correct

```typescript
const job = await geoprocessor.submitJob(asyncGpUrl, params);
await job.waitForJobCompletion();
const out = await job.fetchResultData("Hotspot_Raster");
```

### Impact

Measured: `Error performing execute operation`.

### Diagnosis

That message on a task whose page says `esriExecutionTypeAsynchronous`.

---

## Pitfall 2: Misspelled parameter names

### Anti-pattern

```typescript
geoprocessor.execute(url, { Observation_Point: observer, Viewshed_Distance: distance }); // the tool says Input_Observation_Point
```

### Correct

```typescript
geoprocessor.execute(url, { Input_Observation_Point: observer, Viewshed_Distance: distance });
```

### Impact

Measured: `Unable to complete operation.`, the same message as a wrong type. Case did not matter on this server
(`input_observation_point` worked), spelling did.

### Diagnosis

Copy the names from `<task url>?f=json`.

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

Measured: the result came back as `sum_expr0`, a server-generated name.

### Diagnosis

Unknown result attribute name; always set the alias.

---

## Pitfall 4: Long jobs with no feedback and no way out

### Anti-pattern

```typescript
await job.waitForJobCompletion(); // the user sees nothing for minutes
```

### Correct

```typescript
const cancel = document.querySelector("#cancel")!;
const statusEl = document.querySelector("#status")!;
cancel.addEventListener("click", () => void job.cancelJob(), { once: true });
await job.waitForJobCompletion({
  interval: 1500,
  statusCallback: (j) => { statusEl.textContent = j.jobStatus; }, // e.g. "job-executing"
});
```

### Impact

Measured: `statusCallback` reported `job-executing` before `job-succeeded`; without it the app looks hung.

### Diagnosis

Users abandon long analyses; show the status and offer `cancelJob()`.

---

## Pitfall 5: Reading results by position

### Anti-pattern

```typescript
const out = (result as { results: Array<{ value: FeatureSet }> }).results[0].value; // which output?
```

### Correct

```typescript
const out = (result as { results: Array<{ paramName: string; value: FeatureSet }> }).results
  .find((p) => p.paramName === "Viewshed_Result")?.value;
```

### Impact

Measured: `execute` resolved to `{ results, messages }`, each result with `paramName`, `dataType` and `value`. A
tool with several outputs, or a republished one, breaks code that reads by index.

### Diagnosis

The wrong output on screen after a service change.
