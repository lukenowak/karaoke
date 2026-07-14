#!/usr/bin/env bash
# Generate shareable images from the karaoke page:
#   image/poster.png  — full readable schedule (tall)
#   image/cover.png   — Facebook cover banner (1640x624)
# Run it whenever data.yml changes:  image/make.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
PORT="${PORT:-8137}"

# First run: install Playwright + its Chromium.
if [ ! -d "$DIR/node_modules/playwright" ]; then
  echo "Installing Playwright…"
  (cd "$DIR" && npm install --silent)
fi
(cd "$DIR" && npx --yes playwright install chromium >/dev/null 2>&1 || true)

# Serve the repo root so the page can fetch data.yml.
python3 -m http.server "$PORT" --directory "$ROOT" >/dev/null 2>&1 &
SRV=$!
trap 'kill "$SRV" 2>/dev/null || true' EXIT
sleep 1

BASE="http://localhost:$PORT" OUT="$DIR" node "$DIR/capture.cjs"
echo "Done → $DIR/poster.png, $DIR/cover.png"
