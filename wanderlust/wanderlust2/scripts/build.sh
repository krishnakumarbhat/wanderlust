#!/usr/bin/env bash
# build.sh — Install all dependencies for wanderlust2
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Wanderlust2 Build ==="

# Python backend
echo "[1/2] Installing Python dependencies..."
cd "$PROJECT_DIR/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
deactivate
echo "  ✓ Python deps installed"

# Node frontend
echo "[2/2] Installing Node dependencies..."
cd "$PROJECT_DIR"
npm install --silent
echo "  ✓ Node deps installed"

echo ""
echo "=== Build complete ==="
echo "Run: ./scripts/run_backend.sh  (port 5001)"
echo "Run: ./scripts/run_frontend.sh (port 3000)"
