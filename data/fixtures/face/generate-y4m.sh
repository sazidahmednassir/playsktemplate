#!/usr/bin/env bash
# Convert every .jpg in this folder to a 1-frame Y4M video file.
# Chromium's --use-file-for-fake-video-capture flag requires Y4M format.
# Run once after replacing baseline.jpg (or whenever any .jpg here changes).
#
# Usage:  bash data/fixtures/face/generate-y4m.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install with: brew install ffmpeg  (or apt-get install ffmpeg)" >&2
  exit 1
fi

shopt -s nullglob
for src in *.jpg *.jpeg *.png; do
  base="${src%.*}"
  out="${base}.y4m"
  echo "[y4m] $src -> $out"
  # Loop the still image at 30fps for 2 seconds, scale to 640x480, output Y4M.
  ffmpeg -y -loop 1 -i "$src" -t 2 -r 30 -s 640x480 -pix_fmt yuv420p \
         -f yuv4mpegpipe "$out" -loglevel error
done

echo "Done. Y4M files ready for --use-file-for-fake-video-capture."
ls -la *.y4m
