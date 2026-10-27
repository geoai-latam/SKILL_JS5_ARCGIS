# Extended Pitfalls: Coding Components

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Listening for an event that does not exist

### Anti-pattern

```typescript
// ❌ Anti-pattern
editor.addEventListener("arcgisChange", (e) => save((e as CustomEvent).detail));
```

### Correct

```typescript
editor.addEventListener("arcgisScriptChange", (e) => save(e.detail));
```

### Impact

`arcgisChange` is not an event of the editor: the listener never runs and nothing is saved.

### Diagnosis

TypeScript types `addEventListener` for the element: an unknown name only compiles with a cast.

---

## Pitfall 2: Treating the SQL editor as public API

### Anti-pattern

```typescript
// ❌ Anti-pattern
sqlEditor.layer = featureLayer; // no such property, and the component is @internal
```

### Correct

```typescript
// Build the where clause in your own UI, then check it against the layer:
const n = await layer.queryFeatureCount({ where: clause });
```

### Impact

`arcgis-sql-expression-editor` is `@internal` in 5.1.27 (its profile is `{ id, definitions }`,
not a `layer` property): it can change or disappear in any release.

### Diagnosis

The declaration's docblock says `@internal`.

---

## Pitfall 3: A predefined profile without the definition it needs

### Anti-pattern

```typescript
// ❌ Anti-pattern
editor.profile = { id: "popup", definitions: {} };
```

### Correct

```typescript
editor.profile = { id: "popup", definitions: { $feature: layer } };
```

### Impact

Without `$feature`'s definition the editor cannot list fields; with a loaded layer it flags each
wrong field name with the list of real ones (measured).

### Diagnosis

Completion offers no field names after `$feature.`.

---

## Pitfall 4: Shipping the Arcade assistant by accident

### Anti-pattern

```typescript
// ❌ Anti-pattern: the 5.1 default, in an app that must not send code to an AI service
const editor = document.createElement("arcgis-arcade-editor");
```

### Correct

```typescript
editor.disableAssistant = true;
```

### Impact

In 5.1 the assistant (beta) is on by default and appears for signed-in users of an ArcGIS Online
org that allows AI assistants. `arcadeAssistant` (the 5.0 way to configure it) is deprecated.

### Diagnosis

An AI panel in the editor that you never added.

---

## Pitfall 5: Letting users edit production expressions unguarded

### Anti-pattern

```typescript
// ❌ Anti-pattern: every arcgisScriptChange goes straight to the shared web map
```

### Correct

```typescript
// Apply only with zero diagnostics, run testData first, and save explicitly.
```

### Impact

A runtime error in a valid-but-wrong expression (a division by zero, a missing value) breaks the
popup or the labels for everyone.

### Diagnosis

Errors show up in the map, not in the editor: test with `testData` before saving.
