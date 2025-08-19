#!/bin/bash
set -e

# Enable auto-install of new packages
echo "Checking npm dependencies..."
npm install || true

# Start Vite dev server on all interfaces with polling
exec npm run dev -- --host 0.0.0.0
