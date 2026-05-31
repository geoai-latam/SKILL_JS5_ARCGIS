#!/usr/bin/env bash
# scaffold.sh — bootstrap a Vite + TypeScript + ArcGIS Maps SDK 5.0 project.
# Idempotent: refuses to overwrite an existing directory.
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

# Calcite is pinned to ^5.0 to match the SDK major (NOT 3.x, which is the 4.x era).
echo "📦 Installing ArcGIS dependencies..."
"$PKG_MANAGER" add \
  "@arcgis/map-components@^5.0" \
  "@arcgis/core@^5.0" \
  "@esri/calcite-components@^5.0"

# In 5.0, Calcite's asset path defaults to the SDK CDN, so setAssetPath is usually
# unnecessary. Only configure it when hosting assets locally (use a 5.0.x path then).
cat > src/main.ts <<'EOF'
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-zoom";
import "@esri/calcite-components/dist/components/calcite-shell";
import esriConfig from "@arcgis/core/config.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;

const mapEl = document.querySelector("arcgis-map");
mapEl?.addEventListener("arcgisViewReadyChange", (e) => {
  console.log("View ready:", (e as CustomEvent).detail.view);
});
EOF

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
echo "   cp .env.example .env   # then add your API key"
echo "   $PKG_MANAGER dev"
