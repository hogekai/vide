#!/usr/bin/env bash
set -euo pipefail

echo "Building..."
pnpm build

echo ""
echo "Bundle sizes (gzip):"
echo "------------------------------"

entries=(
	"dist/vide.core.global.js"
	"dist/vide.vast.global.js"
	"dist/vide.vmap.global.js"
	"dist/vide.hls.global.js"
	"dist/vide.dash.global.js"
	"dist/vide.drm.global.js"
	"dist/vide.ssai.global.js"
	"dist/vide.omid.global.js"
	"dist/vide.simid.global.js"
	"dist/vide.vpaid.global.js"
	"dist/vide.ima.global.js"
	"dist/vide.ui.global.js"
	"dist/ui/theme.css"
)

for entry in "${entries[@]}"; do
	if [ -f "$entry" ]; then
		size=$(gzip -c "$entry" | wc -c)
		kb=$(echo "scale=1; $size / 1024" | bc)
		printf "%-28s %s KB\n" "$entry" "$kb"
	else
		printf "%-28s %s\n" "$entry" "NOT FOUND"
	fi
done
