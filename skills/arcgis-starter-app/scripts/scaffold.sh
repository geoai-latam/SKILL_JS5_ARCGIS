#!/usr/bin/env bash
# scaffold.sh — bootstrap a Vite + TypeScript + ArcGIS Maps SDK 5.1 project.
# Idempotent: refuses to overwrite an existing directory.
# Tested 2026-10-27 with pnpm 10 and npm 11 (Vite 8, TypeScript 7, SDK 5.1.27, Calcite 5.2).
set -euo pipefail

PROJECT_NAME="${1:-my-arcgis-app}"
PKG_MANAGER="${PKG_MANAGER:-pnpm}"

if [ -d "$PROJECT_NAME" ]; then
  echo "❌ Directory '$PROJECT_NAME' already exists. Aborting."
  exit 1
fi

echo "📦 Creating Vite + TS project: $PROJECT_NAME"
"$PKG_MANAGER" create vite@latest "$PROJECT_NAME" --template vanilla-ts -- --quiet
cd "$PROJECT_NAME"

# Calcite must match the SDK major (5.x; 3.x is the 4.x era). The SDK 5.1 packages
# declare @esri/calcite-components ^5.1.1 as a peer, so ^5.1 dedupes to one copy.
echo "📦 Installing ArcGIS dependencies..."
"$PKG_MANAGER" add \
  "@arcgis/map-components@^5.1" \
  "@arcgis/core@^5.1" \
  "@esri/calcite-components@^5.1"

# The current Vite template sets moduleResolution "bundler" but not "strict".
if ! grep -q '"strict"' tsconfig.json; then
  sed -i.bak 's/"compilerOptions": {/"compilerOptions": {\n    "strict": true,/' tsconfig.json && rm -f tsconfig.json.bak
fi

# The Vite template ignores *.local but not .env: keep the real key out of git.
grep -qx ".env" .gitignore 2>/dev/null || printf '\n# ArcGIS API key\n.env\n' >> .gitignore

cat > src/main.ts <<'EOF'
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@esri/calcite-components/dist/components/calcite-shell";
import esriConfig from "@arcgis/core/config.js";

const apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string | undefined;
if (apiKey) esriConfig.apiKey = apiKey;
else console.warn("VITE_ARCGIS_API_KEY is empty: arcgis/* basemaps will ask for sign-in. Use basemap=\"osm\" or add .env.");

const mapEl = document.querySelector("arcgis-map");
if (mapEl) {
  // The arcgisViewReadyChange event has no detail (it is null): wait for the element instead.
  await mapEl.viewOnReady();
  console.log("View ready:", mapEl.view.type);
}
EOF

# arcgis/* basemaps need the API key; without it the view waits behind a sign-in dialog.
cat > index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ArcGIS Map App</title>
  <style>html,body,arcgis-map{margin:0;height:100%;width:100%}</style>
</head>
<body>
  <calcite-shell>
    <arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11">
      <arcgis-zoom slot="top-left"></arcgis-zoom>
    </arcgis-map>
  </calcite-shell>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
EOF

cat > .env.example <<'EOF'
VITE_ARCGIS_API_KEY=your_arcgis_api_key_here
EOF

echo "✅ Done. Next steps:"
echo "   cd $PROJECT_NAME"
echo "   cp .env.example .env   # then add your API key (.env is git-ignored)"
echo "   $PKG_MANAGER run dev"
