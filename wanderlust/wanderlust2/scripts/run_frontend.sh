#!/usr/bin/env bash
# run_frontend.sh — Start the Vite dev server
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Starting Wanderlust frontend on http://localhost:3000"
npm run dev
