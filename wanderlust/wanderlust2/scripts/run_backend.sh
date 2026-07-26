#!/usr/bin/env bash
# run_backend.sh — Start the Flask backend server
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR/backend"
source venv/bin/activate

echo "Starting Wanderlust backend on http://0.0.0.0:5001"
python app.py
