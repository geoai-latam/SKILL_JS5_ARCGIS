# Extended Pitfalls: Starter App

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Pinning Calcite to 3.x

### Anti-pattern

```bash
pnpm add @esri/calcite-components@^3.3
```

### Correct

```bash
pnpm add @esri/calcite-components@^5.0
```

### Impact

Version skew with SDK 5.0; icons/components may render incorrectly.

### Diagnosis

Check `package.json` — Calcite should match the SDK major (5.x).

---

## Pitfall 2: Missing container height

### Anti-pattern

```html
<arcgis-map basemap="arcgis/topographic"></arcgis-map>
```

### Correct

```html
<style>html, body, arcgis-map { margin: 0; height: 100%; }</style>
<arcgis-map basemap="arcgis/topographic"></arcgis-map>
```

### Impact

The map renders at 0px height (blank page).

### Diagnosis

Element height is 0 in dev tools.

---

## Pitfall 3: Committing the real .env

### Anti-pattern

```bash
git add .env   # contains the real API key
```

### Correct

```bash
echo ".env" >> .gitignore   # commit only .env.example
```

### Impact

Leaked API key; possible quota abuse and a forced key rotation.

### Diagnosis

`git status` shows `.env` as tracked; secret scanning flags it.

---

## Pitfall 4: Forgetting the VITE_ prefix

### Anti-pattern

```bash
ARCGIS_API_KEY=xxxx   # not exposed to the client
```

### Correct

```bash
VITE_ARCGIS_API_KEY=xxxx
```

### Impact

`import.meta.env.VITE_ARCGIS_API_KEY` is `undefined`; basemap 401s.

### Diagnosis

Log the value during dev — `undefined` means the prefix is missing.

---

## Pitfall 5: Overwriting an existing project

### Anti-pattern

```bash
bash scripts/scaffold.sh existing-dir   # would clobber files
```

### Correct

```bash
# scaffold.sh aborts if the directory exists — choose a new name.
bash scripts/scaffold.sh fresh-dir
```

### Impact

Accidental data loss if a scaffolder overwrites files.

### Diagnosis

The script prints "Directory already exists. Aborting." — pick a new name.
