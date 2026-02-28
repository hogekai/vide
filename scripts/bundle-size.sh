#!/usr/bin/env bash
set -euo pipefail

echo "Building..."
pnpm build

echo ""
echo "Bundle sizes (gzip):"
echo "------------------------------"

entries=(
	"dist/index.mjs"
	"dist/vast/index.mjs"
	"dist/vmap/index.mjs"
	"dist/hls/index.mjs"
	"dist/dash/index.mjs"
	"dist/drm/index.mjs"
	"dist/ssai/index.mjs"
	"dist/omid/index.mjs"
	"dist/simid/index.mjs"
	"dist/ui/index.mjs"
)

for entry in "${entries[@]}"; do
	if [ -f "$entry" ]; then
		size=$(gzip -c "$entry" | wc -c)
		kb=$(echo "scale=2; $size / 1024" | bc)
		printf "%-28s %s KB\n" "$entry" "$kb"
	else
		printf "%-28s %s\n" "$entry" "NOT FOUND"
	fi
done
