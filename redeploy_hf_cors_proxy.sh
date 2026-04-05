#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPACE_ID="${HF_SPACE_ID:-masterp99/rss-proxy}"
SOURCE_DIR="${HF_CORS_PROXY_DIR:-$ROOT_DIR/hf-cors-proxy}"
COMMIT_MESSAGE="${1:-Redeploy RSS CORS proxy}"

if ! command -v hf >/dev/null 2>&1; then
  echo "error: huggingface CLI 'hf' is not installed or not on PATH" >&2
  exit 1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "error: source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

echo "Checking Hugging Face auth..."
hf auth whoami >/dev/null

echo "Ensuring Space exists: $SPACE_ID"
hf repo create "$SPACE_ID" --type space --space-sdk docker --public --exist-ok

echo "Uploading $SOURCE_DIR to $SPACE_ID"
hf upload "$SPACE_ID" "$SOURCE_DIR" . --repo-type space --commit-message "$COMMIT_MESSAGE"

echo "Done. Check:"
echo "  https://${SPACE_ID/\//-}.hf.space/health"
